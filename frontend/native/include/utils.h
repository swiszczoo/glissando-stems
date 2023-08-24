#pragma once

class Utils {
public:
    static double decibels_to_gain(double db);
    static double gain_to_decibels(double gain);
    static void refresh_js_side_from_bg_task();
};
