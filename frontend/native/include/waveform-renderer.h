#pragma once
#include <cstdint>
#include <utility>
#include <vector>

class WaveformRenderer {
public:
    WaveformRenderer();
    WaveformRenderer(int width, int height);

    void set_silence_alpha(uint8_t alpha);
    uint8_t silence_alpha() const;
    void set_waveform_color(uint8_t red, uint8_t green, uint8_t blue, uint8_t alpha);
    uint8_t waveform_color_red() const;
    uint8_t waveform_color_green() const;
    uint8_t waveform_color_blue() const;
    uint8_t waveform_color_alpha() const;
    void set_silence_threshold(int16_t threshold);
    int16_t silence_threshold() const;
    void set_silence_min_length(uint32_t min_length_samples);
    uint32_t silence_min_length() const;

    std::vector<uint8_t> render_waveform_to_png(int32_t offset, uint32_t total_length,
        const int16_t* samples, uint32_t num_samples);

private:
    struct __attribute__((packed)) pixel {
        uint8_t red;
        uint8_t green;
        uint8_t blue;
        uint8_t alpha;
    };

    int _output_width, _output_height;
    uint8_t _color_red, _color_green, _color_blue, _color_alpha;
    uint8_t _silence_alpha;
    int16_t _silence_threshold;
    uint32_t _silence_min_length;

    std::pair<int16_t, int16_t> get_column_peaks(uint32_t start_sample, uint32_t end_sample,
        int32_t offset, const int16_t* samples, uint32_t num_samples);
    uint32_t get_column_end_sample(int x, uint32_t total_length) const;
    int peak_to_pixel(int16_t peak) const;
}; 
