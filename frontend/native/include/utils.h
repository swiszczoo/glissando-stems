#pragma once
#include <stdint.h>

class Utils {
public:
    static double decibels_to_gain(double db);
    static double gain_to_decibels(double gain);
    static uint16_t crc16(const uint8_t* data_p, uint32_t length);
};
