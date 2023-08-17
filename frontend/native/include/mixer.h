#pragma once
#include <memory>
#include <thread>

// Forward declarations
class AudioBuffer;

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


private:
    enum class PlaybackState {
      PLAYING,
      PAUSED,
      STOPPED,
    };

    std::thread _thread;
    std::shared_ptr<AudioBuffer> _buffer;
    std::atomic<PlaybackState> _state;
    std::atomic<uint32_t> _playbackPosition;

    void thread_main();
    void perform_mixdown(audio_chunk& chunk);
};
