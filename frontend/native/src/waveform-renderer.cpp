#include <waveform-renderer.h>

#include <lodepng.h>

#define SAMPLE_MAX 32767
#define SAMPLE_MIX -32768


WaveformRenderer::WaveformRenderer()
    : WaveformRenderer(4096, 128) {}

WaveformRenderer::WaveformRenderer(int width, int height)
    : _output_width(width)
    , _output_height(height)
    , _color_red(255)
    , _color_green(255)
    , _color_blue(255)
    , _color_alpha(255)
    , _silence_alpha(128)
    , _silence_threshold(256)
    , _silence_min_length(100000)
{
}

void WaveformRenderer::set_silence_alpha(uint8_t alpha)
{
    _silence_alpha = alpha;
}

uint8_t WaveformRenderer::silence_alpha() const
{
    return _silence_alpha;
}

void WaveformRenderer::set_waveform_color(uint8_t red, uint8_t green, uint8_t blue, uint8_t alpha)
{
    _color_red = red;
    _color_green = green;
    _color_blue = blue;
    _color_alpha = alpha;
}

uint8_t WaveformRenderer::waveform_color_red() const
{
    return _color_red;
}

uint8_t WaveformRenderer::waveform_color_green() const
{
    return _color_green;
}

uint8_t WaveformRenderer::waveform_color_blue() const
{
    return _color_blue;
}

uint8_t WaveformRenderer::waveform_color_alpha() const
{
    return _color_alpha;
}

void WaveformRenderer::set_silence_threshold(int16_t threshold)
{
    _silence_threshold = threshold;
}

int16_t WaveformRenderer::silence_threshold() const
{
    return _silence_threshold;
}

void WaveformRenderer::set_silence_min_length(uint32_t min_length_samples)
{
    _silence_min_length = min_length_samples;
}

uint32_t WaveformRenderer::silence_min_length() const
{   
    return _silence_min_length;
}

std::vector<uint8_t> WaveformRenderer::render_waveform_to_png(
    int32_t offset, uint32_t total_length, const int16_t* samples, uint32_t num_samples)
{
    auto image = std::make_unique<pixel[]>(_output_width * _output_height);
    for (int i = 0; i < _output_width * _output_height; ++i) {
        image[i].red = image[i].green = image[i].blue = image[i].alpha = 0;
    }

    uint32_t start_sample = 0;
    for (int x = 0; x < _output_width; ++x) {
        uint32_t end_sample = get_column_end_sample(x, total_length);
        auto [hi_peak, low_peak] = get_column_peaks(
            start_sample, end_sample, offset, samples, num_samples);

        int hi_peak_px = peak_to_pixel(hi_peak);
        int low_peak_px = peak_to_pixel(low_peak);

        // Draw waveform
        for (int y = hi_peak_px; y <= low_peak_px; ++y) {
            auto& pixel = image[y * _output_width + x];
            pixel.red = _color_red;
            pixel.green = _color_green;
            pixel.blue = _color_blue;
            pixel.alpha = _color_alpha;
        }

        start_sample = end_sample;
    }

    std::vector<uint8_t> png;
    lodepng::encode(png, reinterpret_cast<uint8_t*>(image.get()), _output_width, _output_height);
    return png;
}

std::pair<int16_t, int16_t> WaveformRenderer::get_column_peaks(uint32_t start_sample, 
    uint32_t end_sample, int32_t offset, const int16_t* samples, uint32_t num_samples)
{
    if (start_sample >= end_sample) {
        return std::make_pair(0, 0);
    }

    int16_t hi_peak = SAMPLE_MIX, low_peak = SAMPLE_MAX;
    for (uint32_t sample = start_sample; sample < end_sample; ++sample) {
        int32_t stem_sample = sample + offset;
        if (stem_sample < 0) continue;
        if (stem_sample >= static_cast<int32_t>(num_samples)) break;

        int16_t left = samples[2 * sample];
        int16_t right = samples[2 * sample + 1];
        
        hi_peak = std::max({ hi_peak, left, right });
        low_peak = std::min({ low_peak, left, right });
    }

    return std::make_pair(hi_peak, low_peak);
}

uint32_t WaveformRenderer::get_column_end_sample(int x, uint32_t total_length) const {
    double fraction = static_cast<double>(x + 1) / _output_width;
    return static_cast<uint32_t>(round(fraction * total_length));
}

int WaveformRenderer::peak_to_pixel(int16_t peak) const
{
    return static_cast<int>(round((32767. - static_cast<double>(peak)) / 65535. * _output_height));
}

