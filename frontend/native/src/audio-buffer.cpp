#include <audio-buffer.h>

#include <cassert>
#include <thread>


AudioBuffer::AudioBuffer(int sampleSize)
    : _underflow_count(0)
    , _read_idx(0)
    , _write_idx(0)
    , _reset_counter(0)
{
    assert(sampleSize > 0);

    _array_size = sampleSize / AUDIO_CHUNK_SAMPLES;
    if (sampleSize % AUDIO_CHUNK_SAMPLES) {
        ++_array_size; // Make it ceil() instead of floor()
    }

    _chunk_array = std::make_unique<audio_chunk[]>(_array_size);
}

int AudioBuffer::underflow_count() const
{
    return _underflow_count;
}

bool AudioBuffer::operator>>(audio_chunk& target)
{
    std::lock_guard lock(_read_lock);

    if (_read_idx == _write_idx) {
        ++_underflow_count;
        return false;
    }

    memcpy(&target, &_chunk_array[_read_idx], sizeof(audio_chunk));
    int next_cell = (_read_idx + 1) % _array_size; 
    _read_idx = next_cell;
    _read_idx.notify_one();
    return true;
}

AudioBuffer& AudioBuffer::operator<<(const audio_chunk& source)
{
    std::unique_lock lock(_write_lock);

    int next_cell = (_write_idx + 1) % _array_size;
    int previous_reset_counter = _reset_counter;
    lock.unlock();

    _read_idx.wait(next_cell);

    lock.lock();

    if (previous_reset_counter == _reset_counter) {
        memcpy(&_chunk_array[_write_idx], &source, sizeof(audio_chunk));
        _write_idx = next_cell;
    }

    return *this;
}

void AudioBuffer::clear()
{
    std::lock_guard lock(_read_lock);
    std::lock_guard lock2(_write_lock);

    for (int i = 0; i < _array_size; ++i) {
        memset(&_chunk_array[i], 0, sizeof(audio_chunk));
    }

    ++_reset_counter;
    _read_idx = _write_idx.load();
    _read_idx.notify_one();
}
