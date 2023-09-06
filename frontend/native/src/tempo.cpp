#include <tempo.h>

#include <audio-buffer.h>


const int Tempo::TICKS_PER_STEP = 4;

Tempo::Tempo()
    : _mode(TempoMode::STABLE)
    , _stable_bpm(120.)
    , _stable_time_sig(4)
    , _last_varying_segment(0)
{
    _stable_samples_per_beat = samples_per_beat_from_bpm(_stable_bpm);
}

void Tempo::set_stable_bpm(double bpm, uint32_t time_signature_numerator)
{
    std::lock_guard lock(_mutex);

    _mode = TempoMode::STABLE;
    _stable_bpm = bpm;
    _stable_samples_per_beat = samples_per_beat_from_bpm(bpm);
    _stable_time_sig = time_signature_numerator;
}

void Tempo::set_varying_bpm(const std::vector<tempo_tag>& tempo_def)
{
    std::lock_guard lock(_mutex);
    
    _mode = TempoMode::VARYING;
    _varying_bpm = tempo_def;
    _last_varying_segment = 0;
}

bool Tempo::bpm_stable() const
{
    std::lock_guard lock(_mutex);
    return _mode == TempoMode::STABLE;
}

bool Tempo::bpm_varying() const
{
    std::lock_guard lock(_mutex);
    return _mode == TempoMode::VARYING;
}

double Tempo::current_bpm(uint32_t track_position) const
{
    std::lock_guard lock(_mutex);

    if (_mode == TempoMode::STABLE) {
        return _stable_bpm;
    }

    if (_varying_bpm.size() < 2) {
        return 0.;
    }

    return varying_current_bpm(track_position);
}

uint32_t Tempo::current_time_signature(uint32_t track_position) const
{
    std::lock_guard lock(_mutex);

    if (_mode == TempoMode::STABLE) {
        return _stable_time_sig;
    }

    if (_varying_bpm.size() < 2) {
        return 0;
    }

    return varying_current_time_signature(track_position);
}

song_position Tempo::current_position(uint32_t track_position) const
{
    std::lock_guard lock(_mutex);

    if (_mode == TempoMode::STABLE) {
        return stable_current_position(track_position);
    }

    if (_varying_bpm.size() < 2) {
        return song_position {
            .bar = 0,
            .step = 0,
            .tick = 0,
        };
    }

    return varying_current_position(track_position);
}

uint32_t Tempo::bar_sample(uint32_t bar) const
{
    std::lock_guard lock(_mutex);

    if (_mode == TempoMode::STABLE) {
        return stable_bar_sample(bar);
    }

    if (_varying_bpm.size() < 2) {
        return 0;
    }

    return varying_bar_sample(bar);
}

double Tempo::samples_per_beat_from_bpm(double bpm)
{
    return AUDIO_SAMPLE_RATE * 60 / bpm;
}

song_position Tempo::stable_current_position(uint32_t track_position) const
{
    double step_position = static_cast<double>(track_position) / _stable_samples_per_beat;
    uint32_t whole_ticks = static_cast<uint32_t>(floor(step_position * TICKS_PER_STEP));
    uint32_t whole_steps = whole_ticks / TICKS_PER_STEP;
    uint32_t whole_bars = whole_steps / _stable_time_sig;
    
    return song_position {
        .bar = whole_bars + 1,
        .step = whole_steps % _stable_time_sig + 1,
        .tick = whole_ticks - whole_bars * _stable_time_sig * TICKS_PER_STEP + 1,
    };
}

uint32_t Tempo::stable_bar_sample(uint32_t bar) const
{
    return static_cast<uint32_t>(
        round(((bar - 1) * _stable_time_sig) * _stable_samples_per_beat));
}

size_t Tempo::varying_bpm_binsearch(
    size_t start, size_t end, uint32_t track_position) const
{
    while (end - start > 1) {
        size_t center = (start + end) >> 1;

        if (track_position < _varying_bpm[center].sample) {
            end = center;
        } else if (track_position > _varying_bpm[center].sample) {
            start = center;
        } else {
            return center;
        }
    }

    return start;
}

size_t Tempo::varying_find_segment_index(uint32_t track_position) const
{
    size_t segment_count = _varying_bpm.size();

    // Start of the track
    if (track_position < _varying_bpm.front().sample) {
        _last_varying_segment = 0;
        return 0;
    }

    // End of the track
    if (track_position >= _varying_bpm.back().sample) {
        _last_varying_segment = segment_count - 1;
        return segment_count - 1;
    }

    // Last search result (in case of sequential queries)
    if (_last_varying_segment > 0 && _last_varying_segment < segment_count) {
        if (track_position >= _varying_bpm[_last_varying_segment - 1].sample 
            && track_position < _varying_bpm[_last_varying_segment].sample) {
            
            return _last_varying_segment;
        }
    }

    // If all pre-checks failed, perform bin-search
    return varying_bpm_binsearch(0, _varying_bpm.size(), track_position) + 1;
}

double Tempo::varying_current_bpm(uint32_t track_position) const
{
    size_t index = varying_find_segment_index(track_position);

    if (index == 0) {
        return 0.;
    }

    uint32_t sample_delta = _varying_bpm[index].sample - _varying_bpm[index - 1].sample;
    uint32_t bar_delta = _varying_bpm[index].bar - _varying_bpm[index - 1].bar;
    uint32_t step_delta = bar_delta * _varying_bpm[index - 1].time_signature_numerator;

    double steps_per_sample = static_cast<double>(step_delta) / static_cast<double>(sample_delta);

    return steps_per_sample * AUDIO_SAMPLE_RATE * 60;
}

uint32_t Tempo::varying_current_time_signature(uint32_t track_position) const
{
    size_t index = varying_find_segment_index(track_position);

    if (index == 0) {
        return 0.;
    }
    
    return _varying_bpm[index - 1].time_signature_numerator;
}

song_position Tempo::varying_current_position(uint32_t track_position) const
{
    size_t index = varying_find_segment_index(track_position);

    if (index == 0) {
        return song_position {
            .bar = 0,
            .step = 1,
            .tick = 1,
        };
    }

    uint32_t sample_delta = _varying_bpm[index].sample - _varying_bpm[index - 1].sample;
    uint32_t bar_delta = _varying_bpm[index].bar - _varying_bpm[index - 1].bar;
    uint32_t time_sig = _varying_bpm[index - 1].time_signature_numerator;
    uint32_t step_delta = bar_delta * time_sig;

    double segment_sample = static_cast<double>(track_position - _varying_bpm[index - 1].sample);
    double step_position_in_segment = segment_sample / sample_delta * step_delta;

    uint32_t whole_ticks = static_cast<uint32_t>(floor(step_position_in_segment * TICKS_PER_STEP));
    uint32_t whole_steps = whole_ticks / TICKS_PER_STEP;
    uint32_t whole_bars = whole_steps / time_sig;

    return song_position {
        .bar = _varying_bpm[index - 1].bar + whole_bars,
        .step = whole_steps % time_sig + 1,
        .tick = whole_ticks - whole_bars * time_sig * TICKS_PER_STEP + 1,
    };
}

uint32_t Tempo::varying_bar_sample(uint32_t bar) const
{
    for (auto it = _varying_bpm.rbegin(); it != _varying_bpm.rend(); ++it) {
        if (it->bar > bar) {
            continue;
        }

        auto it_next = it;

        if (it == _varying_bpm.rbegin()) {
            --it;
        } else {
            ++it_next;
        }

        double sample_delta = it_next->sample - it->sample;
        double bar_delta = it_next->bar - it->bar;
        double result = (bar - it->bar) / bar_delta * sample_delta + it->sample;

        return static_cast<uint32_t>(round(result));
    }

    return 0;
}
