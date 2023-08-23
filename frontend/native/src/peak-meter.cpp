#include <peak-meter.h>

#include <audio-buffer.h>
#include <filter-fir.h>
#include <utils.h>

#include <array>
#include <cstdlib>

// LPF taps definition (Hamming window, sample rate 176400 Hz, cutoff 22050 Hz)
std::array RESAMPLER_TAPS = {
    -0.000327739447665758f,
    -0.000476503758124312f,
    -0.000352854190773928f,
    -0.000000000000000001f,
    0.000406260236619067f,
    0.000628593199614187f,
    0.000490884934198210f,
    -0.000000000000000001f,
    -0.000609788856962969f,
    -0.000966047088142002f,
    -0.000766208000080543f,
    0.000000000000000006f,
    0.000963612783534569f,
    0.001525728306847041f,
    0.001205789350705905f,
    -0.000000000000000002f,
    -0.001496950835348211f,
    -0.002350947122309537f,
    -0.001841889519823695f,
    0.000000000000000003f,
    0.002246185734559464f,
    0.003496814481702800f,
    0.002716496970288577f,
    -0.000000000000000004f,
    -0.003260962730025787f,
    -0.005040383400506451f,
    -0.003889780195494825f,
    0.000000000000000005f,
    0.004616038373534016f,
    0.007100598452505119f,
    0.005456954456939170f,
    -0.000000000000000006f,
    -0.006435756097543829f,
    -0.009880347762417137f,
    -0.007584638951651009f,
    0.000000000000000007f,
    0.008949590428842996f,
    0.013764747050914815f,
    0.010598615005927948f,
    -0.000000000000000008f,
    -0.012636534237729955f,
    -0.019587784806651305f,
    -0.015233440072845680f,
    0.000000000000000009f,
    0.018684176366768283f,
    0.029538279853251533f,
    0.023547112370130258f,
    -0.000000000000000009f,
    -0.031020789456173804f,
    -0.051687897771284415f,
    -0.044224482837815764f,
    0.000000000000000010f,
    0.074600943500622269f,
    0.158848192209276928f,
    0.225151831805774777f,
    0.250268562533626671f,
    0.225151831805774777f,
    0.158848192209276928f,
    0.074600943500622269f,
    0.000000000000000010f,
    -0.044224482837815771f,
    -0.051687897771284415f,
    -0.031020789456173804f,
    -0.000000000000000009f,
    0.023547112370130262f,
    0.029538279853251536f,
    0.018684176366768286f,
    0.000000000000000009f,
    -0.015233440072845678f,
    -0.019587784806651309f,
    -0.012636534237729959f,
    -0.000000000000000008f,
    0.010598615005927948f,
    0.013764747050914818f,
    0.008949590428842998f,
    0.000000000000000007f,
    -0.007584638951651012f,
    -0.009880347762417141f,
    -0.006435756097543833f,
    -0.000000000000000006f,
    0.005456954456939171f,
    0.007100598452505122f,
    0.004616038373534018f,
    0.000000000000000005f,
    -0.003889780195494823f,
    -0.005040383400506452f,
    -0.003260962730025787f,
    -0.000000000000000004f,
    0.002716496970288581f,
    0.003496814481702800f,
    0.002246185734559465f,
    0.000000000000000003f,
    -0.001841889519823696f,
    -0.002350947122309539f,
    -0.001496950835348211f,
    -0.000000000000000002f,
    0.001205789350705906f,
    0.001525728306847041f,
    0.000963612783534570f,
    0.000000000000000006f,
    -0.000766208000080543f,
    -0.000966047088142002f,
    -0.000609788856962969f,
    -0.000000000000000001f,
    0.000490884934198210f,
    0.000628593199614187f,
    0.000406260236619067f,
    -0.000000000000000001f,
    -0.000352854190773928f,
    -0.000476503758124312f,
    -0.000327739447665758f,
};

const double PeakMeter::DESCENT_RATE = 0.99991;

class PeakMeter::impl {
private:
    using FilterType = FIRFilter<RESAMPLER_TAPS.size()>;
    PeakMeter* _instance;
    FilterType _left_lpf;
    FilterType _right_lpf;
    double _left_peak, _right_peak;

    void process_sample(float sample, FilterType& filter, double& peak)
    {
        // Based on ITU.R BS.1770-4 Annex 2
        // Omitting -12.04 dB attenuation - floating point arithmetic is used

        peak *= PeakMeter::DESCENT_RATE;
        float this_peak = std::abs(sample);
        
        // Oversample 4x and put into LPF
        this_peak = std::max(this_peak, std::abs(filter(sample)));
        this_peak = std::max(this_peak, std::abs(filter(0.f)));
        this_peak = std::max(this_peak, std::abs(filter(0.f)));
        this_peak = std::max(this_peak, std::abs(filter(0.f)));

        if (this_peak > peak) {
            peak = this_peak;
        }
    }

public:
    impl(PeakMeter* instance)
        : _instance(instance)
        , _left_lpf(RESAMPLER_TAPS)
        , _right_lpf(RESAMPLER_TAPS)
        , _left_peak(0.0)
        , _right_peak(0.0)
    {
    }

    double left_db() const
    {
        return Utils::gainToDecibels(_left_peak);
    }

    double right_db() const
    {
        return Utils::gainToDecibels(_right_peak);
    }

    void process(const audio_chunk& chunk)
    {
        for (int i = 0; i < AUDIO_CHUNK_SAMPLES; ++i) {
            process_sample(chunk.left_channel[i], _left_lpf, _left_peak);
            process_sample(chunk.right_channel[i], _right_lpf, _right_peak);
        }
    }

    void reset()
    {
        _left_peak = 0.0;
        _right_peak = 0.0;
    }
};

PeakMeter::PeakMeter()
    : _pimpl(std::make_unique<impl>(this))
{
}

PeakMeter::~PeakMeter() = default;

double PeakMeter::left_db() const
{
    return _pimpl->left_db();
}

double PeakMeter::right_db() const
{
    return _pimpl->right_db();
}

void PeakMeter::process(const audio_chunk& chunk)
{
    _pimpl->process(chunk);
}

void PeakMeter::reset()
{
    _pimpl->reset();
}

