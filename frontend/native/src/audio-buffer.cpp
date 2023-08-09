#include <audio-buffer.h>

#include <cassert>


AudioBuffer::AudioBuffer(int sampleSize)
    : _underflow_count(0)
    , _read_idx(0)
    , _write_idx(0)
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
    int next_cell = (_write_idx + 1) % _array_size;
    _read_idx.wait(next_cell);

    memcpy(&_chunk_array[_write_idx], &source, sizeof(audio_chunk));

    _write_idx = next_cell;
    return *this;
}
