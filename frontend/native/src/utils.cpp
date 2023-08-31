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

uint16_t Utils::crc16(const uint8_t* data_p, uint32_t length)
{
    uint8_t x;
    uint16_t crc = 0xFFFF;

    while (length--){
        x = crc >> 8 ^ *data_p++;
        x ^= x >> 4;
        crc = (crc << 8) ^ ((uint16_t)(x << 12)) ^ ((uint16_t)(x << 5)) ^ ((uint16_t)x);
    }
    return crc;
}
