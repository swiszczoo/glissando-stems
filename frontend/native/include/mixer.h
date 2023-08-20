#pragma once
#include <spin-lock.h>

#include <memory>
#include <thread>

// Forward declarations
class AudioBuffer;
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
    bool set_playback_position(uint32_t new_position);
    int sample_rate() const;
    void set_metronome_enabled(bool enabled);
    void toggle_metronome();
    bool metronome_enabled() const;
    void set_metronome_gain_db(double gain);
    double metronome_gain_db() const;
    void set_track_bpm(double bpm);
    double track_bpm() const;
    double left_channel_out_db() const;
    double right_channel_out_db() const;
    void set_track_length(uint32_t samples);
    uint32_t track_length() const;

private:
    enum class PlaybackState {
      PLAYING,
      PAUSED,
      STOPPED,
    };

    std::thread _thread;
    std::shared_ptr<AudioBuffer> _buffer;
    std::atomic<PlaybackState> _state;
    std::atomic<uint32_t> _playback_position;
    std::atomic<uint32_t> _length;

    std::unique_ptr<PeakMeter> _master_level;
    std::unique_ptr<Metronome> _metronome;
    std::atomic_bool _metronome_enabled;
    std::atomic<double> _metronome_gain_db;
    std::atomic<double> _bpm;

    SpinLock _mixdown_lock;

    void thread_main();
    void perform_mixdown(audio_chunk& chunk);
};
