#pragma once
#include <cstdint>
#include <mutex>
#include <vector>

struct tempo_tag {
    uint32_t sample;
    uint32_t bar;
    uint32_t time_signature_numerator; // e.g. 3 for 3/4, or 4 for 4/4 time signatures
};

struct song_position {
    uint32_t bar;
    uint32_t step;
    uint32_t tick;

    bool operator==(const song_position&) const = default;
    bool operator!=(const song_position&) const = default;
};

/**
 * \class
 * \brief This class keeps track of current BPM, time signature and
 *        track position.
 * 
 * It supports both stable and varying BPM types.
 */
class Tempo {
public:
    Tempo();

    void set_stable_bpm(double bpm, uint32_t time_signature_numerator);
    void set_varying_bpm(const std::vector<tempo_tag>& tempo_def);
    bool bpm_stable() const;
    bool bpm_varying() const;
    
    double current_bpm(uint32_t track_position) const;
    uint32_t current_time_signature(uint32_t track_position) const;
    song_position current_position(uint32_t track_position) const;

    uint32_t bar_sample(uint32_t bar) const;

private:
    enum class TempoMode { STABLE, VARYING };
    static const int TICKS_PER_STEP;

    mutable std::mutex _mutex;

    TempoMode _mode;
    double _stable_bpm;
    double _stable_samples_per_beat;
    uint32_t _stable_time_sig;
    std::vector<tempo_tag> _varying_bpm;
    mutable uint32_t _last_varying_segment; // for optimization purposes

    static double samples_per_beat_from_bpm(double bpm);

    song_position stable_current_position(uint32_t track_position) const;
    uint32_t stable_bar_sample(uint32_t bar) const;

    size_t varying_bpm_binsearch(
        size_t start, size_t end, uint32_t track_position) const;
    size_t varying_find_segment_index(uint32_t track_position) const;
    double varying_current_bpm(uint32_t track_position) const;
    uint32_t varying_current_time_signature(uint32_t track_position) const;
    song_position varying_current_position(uint32_t track_position) const;
    uint32_t varying_bar_sample(uint32_t bar) const;
};
