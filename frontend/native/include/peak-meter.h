#pragma once
#include <memory>

// Forward declarations
struct audio_chunk;

class PeakMeter {
public:
    PeakMeter();
    ~PeakMeter();

    double left_db() const;
    double right_db() const;
    void process(const audio_chunk& chunk);

private:
    static const double DESCENT_RATE;

    class impl;
    std::unique_ptr<impl> _pimpl;
};
