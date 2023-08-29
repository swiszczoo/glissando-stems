#include <metronome.h>

#include <audio-buffer.h>


const int Metronome::TICK_OFFSET = 128;

Metronome::Metronome()
    : _bpm(120.0)
    , _gain(1.0)
    , _current_sample(reinterpret_cast<const int16_t*>(SOUND_BAR))
    , _current_sample_length(SOUND_BAR_SAMPLES)
    , _sample_position(SOUND_BAR_SAMPLES)
{
    _samples_per_beat = Metronome::samples_per_beat_from_bpm(_bpm);
}

void Metronome::set_bpm(double new_bpm)
{
    if (new_bpm > 0.0) {
        _bpm = new_bpm;
        _samples_per_beat = Metronome::samples_per_beat_from_bpm(new_bpm);
    }
}

double Metronome::bpm() const
{
    return _bpm;
}

void Metronome::set_gain(double new_gain)
{
    _gain = new_gain;
}

double Metronome::gain() const
{
    return _gain;
}

void Metronome::process(uint32_t first_sample)
{
    uint32_t prev_tick_id = floor((first_sample + TICK_OFFSET - 1) / _samples_per_beat);
    for (int i = 0; i < AUDIO_CHUNK_SAMPLES; ++i) {
        uint32_t sample = first_sample + i + TICK_OFFSET;
        uint32_t next_tick_id = floor(sample / _samples_per_beat);

        if (prev_tick_id + 1 == next_tick_id || sample == TICK_OFFSET) {
            // Metronome should tick right now
            if (next_tick_id % 4 == 0) {
                // Bar tick
                _current_sample = reinterpret_cast<const int16_t*>(SOUND_BAR);
                _current_sample_length = SOUND_BAR_SAMPLES;
            } else {
                // Beat tick
                _current_sample = reinterpret_cast<const int16_t*>(SOUND_BEAT);
                _current_sample_length = SOUND_BEAT_SAMPLES;
            }
            _sample_position = 0;
        }

        prev_tick_id = next_tick_id;
    }
}

void Metronome::render(audio_chunk& chunk)
{
    for (int i = 0; i < AUDIO_CHUNK_SAMPLES; ++i) {
        if (_sample_position < _current_sample_length) {
            float sample_value = _current_sample[_sample_position++] / 32768.0 * _gain;
            chunk.left_channel[i] += sample_value;
            chunk.right_channel[i] += sample_value;
        }
    }
}

double Metronome::samples_per_beat_from_bpm(double bpm)
{
    return AUDIO_SAMPLE_RATE * 60 / bpm;
}
