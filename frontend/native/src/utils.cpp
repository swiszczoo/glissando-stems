#include <utils.h>

#include <cmath>
#include <emscripten.h>


double Utils::decibels_to_gain(double db)
{
    return pow(10.0, db / 20.0);
}

double Utils::gain_to_decibels(double gain)
{
    return 20.0 * log10(gain);
}
