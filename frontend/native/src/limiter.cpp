#include <limiter.h>

#include <audio-buffer.h>
#include <utils.h>

#include <algorithm>
#include <limits>


// TODO: implement ratio parameter

const double Limiter::PEAK_DESCENT_RATE = 0.999;

Limiter::Limiter()
    : _attack_ms(5.)
    , _release_ms(24.)
    , _knee_db(0.)
    , _ratio(std::numeric_limits<double>::infinity())
    , _threshold_db(-1.)
    , _current_peak_l(0.)
    , _current_peak_r(0.)
    , _current_reduction_l(0.)
    , _current_reduction_r(0.)
{
}

void Limiter::set_attack_ms(double attack_ms)
{
    _attack_ms = attack_ms;
}

double Limiter::attack_ms() const
{
    return _attack_ms;
}

void Limiter::set_release_ms(double release_ms)
{
    _release_ms = release_ms;
}

double Limiter::release_ms() const
{
    return _release_ms;
}

void Limiter::set_knee_db(double knee_db)
{
    _knee_db = knee_db;
}

double Limiter::knee_db() const
{
    return _knee_db;
}

void Limiter::set_ratio(double ratio)
{
    _ratio = ratio;
}

double Limiter::ratio() const
{
    return _ratio;
}

void Limiter::set_threshold_db(double threshold_db)
{
    _threshold_db = threshold_db;
}

double Limiter::threshold_db() const
{
    return _threshold_db;
}

double Limiter::reduction_db() const
{
    return _reduction_db;
}

void Limiter::apply(audio_chunk& chunk)
{
    limiter_settings settings = {
        .attack = _attack_ms,
        .attack_coeff = milliseconds_to_ewma_coeff(_attack_ms),
        .release = _release_ms,
        .release_coeff = milliseconds_to_ewma_coeff(_release_ms),
        .knee = _knee_db,
        .ratio = _ratio,
        .threshold = _threshold_db,
    };

    for (int i = 0; i < AUDIO_CHUNK_SAMPLES; ++i) {
        process_sample(settings, chunk.left_channel[i], _current_peak_l, _current_reduction_l);
        process_sample(settings, chunk.right_channel[i], _current_peak_r, _current_reduction_r);
    }

    _reduction_db = std::min(_current_reduction_l, _current_reduction_r);
}

void Limiter::process_sample(const limiter_settings& settings, 
    float& sample, double& peak, double& reduction)
{
    peak *= PEAK_DESCENT_RATE;
    peak = std::max<double>({ peak, std::abs(sample) });

    double peak_db = Utils::gain_to_decibels(peak);
    double target_db = calculate_target_db(settings, peak_db);
    double target_gain_db = target_db - peak_db;

    if (reduction < target_gain_db) {
        reduction += settings.release_coeff * (target_gain_db - reduction);
    } else if (reduction > target_gain_db) {
        reduction += settings.attack_coeff * (target_gain_db - reduction);
    }

    double sample_gain = Utils::decibels_to_gain(reduction);
    sample *= sample_gain;
}

double Limiter::calculate_target_db(const limiter_settings& settings, double input_db)
{
    if (input_db < settings.threshold - settings.knee / 2.) return input_db;
    if (input_db > settings.threshold + settings.knee / 2.) return settings.threshold;
    return input_db - std::pow(input_db - settings.threshold + settings.knee / 2., 2.) / (2. * settings.knee);
}

double Limiter::milliseconds_to_ewma_coeff(double time_ms) const
{
    if (time_ms < 0.001) return 0;
    return 1 - std::exp(-2. * M_PI * 100.0 / AUDIO_SAMPLE_RATE / time_ms);
}

