#include <metronome.h>

#include <audio-buffer.h>
#include <tempo.h>


const int Metronome::TICK_OFFSET = 128;

Metronome::Metronome(const Tempo& tempo)
    : _tempo(tempo)
    , _gain(1.0)
    , _current_sample(reinterpret_cast<const int16_t*>(SOUND_BAR))
    , _current_sample_length(SOUND_BAR_SAMPLES)
    , _sample_position(SOUND_BAR_SAMPLES)
{
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
    auto prev_position = _tempo.current_position(first_sample + TICK_OFFSET - 1);

    for (int i = 0; i < AUDIO_CHUNK_SAMPLES; ++i) {
        uint32_t sample = first_sample + i + TICK_OFFSET;
        auto next_position = _tempo.current_position(sample);
        next_position.tick = prev_position.tick;

        if (prev_position != next_position || sample == TICK_OFFSET) {
            // Metronome should tick right now

            if (next_position.step == 1) {
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

        prev_position = next_position;
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

