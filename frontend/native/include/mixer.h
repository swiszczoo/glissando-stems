#pragma once
#include <spin-lock.h>
#include <stem-manager.h>
#include <tempo.h>

#include <memory>
#include <thread>

// Forward declarations
class AudioBuffer;
class Limiter;
class Metronome;
class PeakMeter;

struct audio_chunk;


/**
 * \class
 * \brief This class runs in its own thread and generates an output stream
 *        for the audio context
 */
class Mixer {
public:
    Mixer(std::shared_ptr<AudioBuffer> out_buffer);
    ~Mixer();

    int test_js_binding() const;
    
    void play();
    void pause();
    void stop();

    std::string playback_state() const;
    void reset_playback();
    uint32_t playback_position() const;
    song_position playback_position_bst() const;
    bool set_playback_position(uint32_t new_position);
    uint32_t bar_sample(uint32_t bar) const;

    int sample_rate() const;

    void set_metronome_enabled(bool enabled);
    void toggle_metronome();
    bool metronome_enabled() const;
    void set_metronome_gain_db(double gain);
    double metronome_gain_db() const;

    void set_track_bpm(double bpm);
    void set_track_varying_bpm(const std::vector<tempo_tag>& tags);
    double track_bpm() const;
    double left_channel_out_db() const;
    double right_channel_out_db() const;

    void set_track_length(uint32_t samples);
    uint32_t track_length() const;

    size_t count_stems() const;
    void update_stem_info(const std::vector<stem_info>& info);

    uint32_t waveform_ordinal(uint32_t stem_id) const;
    std::string waveform_data_uri(uint32_t stem_id) const;

    void toggle_mute(uint32_t stem_id);
    void toggle_solo(uint32_t stem_id);
    bool stem_muted(uint32_t stem_id) const;
    bool stem_soloed(uint32_t stem_id) const;

    double limiter_reduction_db() const;

private:
    enum class PlaybackState {
        PLAYING,
        PAUSED,
        STOPPED,
    };

    std::thread _thread;
    std::shared_ptr<AudioBuffer> _buffer;
    std::atomic<PlaybackState> _state;
    PlaybackState _last_state;
    std::atomic<uint32_t> _playback_position;
    uint32_t _last_playback_position;
    std::atomic<uint32_t> _length;

    std::unique_ptr<Tempo> _tempo;
    std::unique_ptr<PeakMeter> _master_level;
    std::unique_ptr<Metronome> _metronome;
    std::atomic_bool _metronome_enabled;
    std::atomic<double> _metronome_gain_db;
    
    std::unique_ptr<Limiter> _limiter;

    SpinLock _mixdown_lock;

    StemManager _stems;

    void thread_main();
    void perform_mixdown(audio_chunk& chunk);
    void apply_soft_start(audio_chunk& chunk);
    void apply_soft_stop(audio_chunk& chunk);
    void invalidate_state();
};
