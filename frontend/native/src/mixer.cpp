#include <mixer.h>

#include <audio-buffer.h>
#include <metronome.h>
#include <peak-meter.h>
#include <utils.h>

#include <emscripten.h>

#include <cassert>
#include <iostream>

#define UNDERFLOW_COUNTDOWN_INITIAL_VALUE 1000

Mixer::Mixer(std::shared_ptr<AudioBuffer> out_buffer)
    : _buffer(std::move(out_buffer))
    , _state(PlaybackState::STOPPED)
    , _last_state(PlaybackState::STOPPED)
    , _playback_position(0)
    , _last_playback_position(0)
    , _length(0)
    , _master_level(std::make_unique<PeakMeter>())
    , _metronome(std::make_unique<Metronome>())
    , _metronome_enabled(false)
    , _metronome_gain_db(1.0)
    , _bpm(120.0)
{
    _manager.set_bg_task_complete_callback(
        std::bind(&Mixer::invalidate_state, this));

    _thread = std::thread(&Mixer::thread_main, this);
}

Mixer::~Mixer()
{
    _thread.detach();
}

int Mixer::test_js_binding() const
{
    return 2137;
}

void Mixer::play()
{
    _state = PlaybackState::PLAYING;
    invalidate_state();
}

void Mixer::pause()
{
    _state = PlaybackState::PAUSED;
    invalidate_state();
}

void Mixer::stop()
{
    std::lock_guard lock(_mixdown_lock);

    _state = PlaybackState::STOPPED;
    reset_playback();
    _buffer->clear();
}

std::string Mixer::playback_state() const
{
    switch (_state) {
        case PlaybackState::PLAYING: return "play";
        case PlaybackState::PAUSED: return "pause";
        case PlaybackState::STOPPED: return "stop";
    }

    assert(false);
    return "unknown";
}

void Mixer::reset_playback()
{
    _playback_position = 0;
    invalidate_state();
}

uint32_t Mixer::playback_position() const
{
    return _playback_position;
}

bool Mixer::set_playback_position(uint32_t new_position)
{
    if (_state != PlaybackState::STOPPED) {
        _playback_position = new_position;
        return true;
    }

    return false;
}

int Mixer::sample_rate() const
{
    return AUDIO_SAMPLE_RATE;
}

void Mixer::set_metronome_enabled(bool enabled)
{
    if (enabled != _metronome_enabled) {
        _metronome_enabled = enabled;
        invalidate_state();
    }
}

void Mixer::toggle_metronome()
{
    _metronome_enabled = !_metronome_enabled;
    invalidate_state();
}

bool Mixer::metronome_enabled() const
{
    return _metronome_enabled;
}

void Mixer::set_metronome_gain_db(double gain)
{
    if (gain != _metronome_gain_db) {
        _metronome_gain_db = gain;
        invalidate_state();
    }
}

double Mixer::metronome_gain_db() const
{
    return _metronome_gain_db;
}

void Mixer::set_track_bpm(double bpm)
{
    if (bpm != _bpm) {
        _bpm = bpm;
        invalidate_state();
    }
}

double Mixer::track_bpm() const
{
    return _bpm;
}

double Mixer::left_channel_out_db() const
{
    return _master_level->left_db();
}

double Mixer::right_channel_out_db() const
{
    return _master_level->right_db();
}

void Mixer::set_track_length(uint32_t samples)
{
    if (samples != _length) {
        _length = samples;
        _manager.set_track_length(samples);
        invalidate_state();
    }
}

uint32_t Mixer::track_length() const
{
    return _length;
}

void Mixer::update_stem_info(const std::vector<stem_info>& info)
{
    _manager.update_stem_info(info);
}

uint32_t Mixer::waveform_ordinal(uint32_t stem_id) const
{
    return _manager.waveform_ordinal(stem_id);
}

std::string Mixer::waveform_data_uri(uint32_t stem_id) const
{
    return _manager.waveform_data_uri(stem_id);
}

void Mixer::thread_main()
{
    int last_underflows = _buffer->underflow_count();
    int undeflow_check_countdown = 1000;

    std::cout << "[MIXER] Audio processing thread started" << std::endl;

    while (true) {
        audio_chunk chunk;
        for (int i = 0; i < AUDIO_CHUNK_SAMPLES; ++i) {
            chunk.left_channel[i] = 0;
            chunk.right_channel[i] = 0;
        }

        perform_mixdown(chunk);

        (*_buffer) << chunk;

        if (_playback_position >= _length) {
            stop();
        }

        if (--undeflow_check_countdown == 0) {
            int current_undeflows = _buffer->underflow_count();
            if (current_undeflows > last_underflows) {
                int underflow_delta = current_undeflows - last_underflows;
                std::cerr << "[MIXER] Can't keep up! "
                          << "Buffer underflowed " << underflow_delta << " time(s)" << std::endl;
                last_underflows = current_undeflows;
                undeflow_check_countdown = UNDERFLOW_COUNTDOWN_INITIAL_VALUE;
            }
        }
    }
}

void Mixer::perform_mixdown(audio_chunk& chunk)
{
    std::lock_guard lock(_mixdown_lock);

    uint32_t position = _playback_position;
    PlaybackState state = _state;

    if (state == PlaybackState::PLAYING) {
        _manager.render(position, chunk);
        
        if (_metronome_enabled) {
            _metronome->set_bpm(_bpm);
            _metronome->set_gain(Utils::decibels_to_gain(_metronome_gain_db));
            _metronome->process(position);
        }

        position += AUDIO_CHUNK_SAMPLES;
    }
    if (state == PlaybackState::STOPPED) {
        _master_level->reset();
    }

    // This two routines should prevent audio clicking by performing
    // a fade-in or a fade-out respectively
    if (state == PlaybackState::PLAYING && _last_state == PlaybackState::PAUSED) {
        apply_soft_start(chunk);
    } else if (state == PlaybackState::PAUSED && _last_state == PlaybackState::PLAYING) {
        // render last frame to make a fade-out frame 
        // (state != PLAYING so it wasn't rendered yet)
        _manager.render(_last_playback_position, chunk); 

        apply_soft_stop(chunk);
    }

    _metronome->render(chunk);
    _master_level->process(chunk);
    _playback_position = position;

    _last_state = state;
    _last_playback_position = position;
}

void Mixer::apply_soft_start(audio_chunk& chunk)
{
    for (int i = 0; i < AUDIO_CHUNK_SAMPLES; ++i) {
        float factor = static_cast<float>(i) / AUDIO_CHUNK_SAMPLES;
        factor *= factor;

        chunk.left_channel[i] *= factor;
        chunk.right_channel[i] *= factor;
    }
}

void Mixer::apply_soft_stop(audio_chunk& chunk)
{
    for (int i = 0; i < AUDIO_CHUNK_SAMPLES; ++i) {
        float factor = 1.f - static_cast<float>(i) / AUDIO_CHUNK_SAMPLES;
        factor *= factor;

        chunk.left_channel[i] *= factor;
        chunk.right_channel[i] *= factor;
    }
}

void Mixer::invalidate_state()
{
    MAIN_THREAD_EM_ASM({
        if (window._invalidateModuleContext) {
            window._invalidateModuleContext();
        }
    });
}
