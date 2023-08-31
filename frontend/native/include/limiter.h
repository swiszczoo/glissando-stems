#pragma once
#include <atomic>

// Forward declarations
struct audio_chunk;

class Limiter {
public:
    Limiter();

    void set_attack_ms(double attack_ms);
    double attack_ms() const;
    void set_release_ms(double release_ms);
    double release_ms() const;
    void set_knee_db(double knee_db);
    double knee_db() const;
    void set_ratio(double ratio);
    double ratio() const;
    void set_threshold_db(double threshold_db);
    double threshold_db() const;
    double reduction_db() const;

    void apply(audio_chunk& chunk);

private:
    struct limiter_settings {
        double attack;
        double attack_coeff;
        double release;
        double release_coeff;
        double knee;
        double ratio;
        double threshold;
    };

    static const double PEAK_DESCENT_RATE;

    std::atomic<double> _attack_ms;
    std::atomic<double> _release_ms;
    std::atomic<double> _knee_db;
    std::atomic<double> _ratio;
    std::atomic<double> _threshold_db;
    std::atomic<double> _reduction_db;

    double _current_peak_l, _current_peak_r;
    double _current_reduction_l, _current_reduction_r;

    void process_sample(const limiter_settings& settings, 
        float& sample, double& peak, double& reduction);
    double calculate_target_db(const limiter_settings& settings, double input_db);
    double milliseconds_to_ewma_coeff(double time_ms) const;
};
