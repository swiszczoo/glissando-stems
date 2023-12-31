#pragma once
#include <spin-lock.h>

#include <atomic>
#include <condition_variable>
#include <memory>
#include <mutex>

#define AUDIO_CHUNK_SAMPLES 128
#define AUDIO_SAMPLE_RATE 44100

struct audio_chunk {
    float left_channel[AUDIO_CHUNK_SAMPLES];
    float right_channel[AUDIO_CHUNK_SAMPLES];
};

/**
 * \class 
 * \brief This class provides a thread-safe circular audio buffer 
 * 
 * The buffer can be used by both worklet and worker threads simultaneously.
 */
class AudioBuffer {
public:
    AudioBuffer(int sampleSize);

    int underflow_count() const;
    bool operator>>(audio_chunk& target);
    AudioBuffer& operator<<(const audio_chunk& source);
    void clear();

private:
    std::unique_ptr<audio_chunk[]> _chunk_array;
    int _array_size;
    std::atomic_int _underflow_count;
    std::atomic_int _read_idx;
    std::atomic_int _write_idx;
    std::atomic_int _reset_counter;
    SpinLock _read_lock, _write_lock;
};
