#include <utils.h>

#include <cmath>


double Utils::decibelsToGain(double db)
{
    return pow(10.0, db / 20.0);
}

double Utils::gainToDecibels(double gain)
{
    return 20.0 * log10(gain);
}

