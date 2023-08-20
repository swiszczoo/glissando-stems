#pragma once
#include <array>
#include <functional>

/**
 * \class
 * 
 * \brief A template class that implements a simple FIR filter
 * 
 * \tparam taps number of taps the filter has (and its internal history
 *              buffer size)
 */
template <unsigned long taps>
class FIRFilter {
public:
    FIRFilter(const std::array<float, taps>& coefficients)
        : _history_index(0)
    {
        for (int i = 0; i < taps; ++i) _coeffs[i] = coefficients[i];
        _history.fill(0.f);
    }

    float operator()(float in_sample)
    {
        _history[_history_index++] = in_sample;
        if (_history_index >= taps) {
            _history_index -= taps;
        }

        // Convolve
        float output_sample = 0.f;
        int current_history_index = _history_index;

        // We prefer speed over binary size
        loop_unroll<taps>([&](int i) {
            output_sample += _coeffs[i] * _history[current_history_index--];

            if (current_history_index < 0) { // This should be faster than modulo
                current_history_index += taps;
            }
        });

        return output_sample;
    }

private:
    std::array<float, taps> _coeffs;
    std::array<float, taps> _history;
    int _history_index;

    template <int N, typename FunType, int i = 0>
    void loop_unroll(FunType loop_body) {
        if constexpr (i < N) {
            loop_body(i);
            loop_unroll<N, FunType, i + 1>(loop_body);
        }
    }

};
