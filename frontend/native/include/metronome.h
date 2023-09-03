#pragma once
#include <stdint.h>

// Forward declarations
struct audio_chunk;
class Tempo;

class Metronome {
public:
    Metronome(const Tempo& tempo);

    void set_gain(double gain);
    double gain() const;

    void process(uint32_t first_sample);
    void render(audio_chunk& chunk);

private:
    static const uint8_t SOUND_BAR[];
    static const int SOUND_BAR_SAMPLES;
    static const uint8_t SOUND_BEAT[];
    static const int SOUND_BEAT_SAMPLES;
    static const int TICK_OFFSET;

    const Tempo& _tempo;
    double _gain;
    const int16_t* _current_sample;
    int _current_sample_length;
    int _sample_position;
};
