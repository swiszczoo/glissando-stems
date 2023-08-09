#pragma once
#include <memory>
#include <thread>

// Forward declarations
class AudioBuffer;

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

private:
    std::thread _thread;
    std::shared_ptr<AudioBuffer> _buffer;

    void thread_main();
};
