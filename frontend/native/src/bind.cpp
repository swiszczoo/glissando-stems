#include <mixer.h>
#include <stem-manager.h>

#include <emscripten/bind.h>

using namespace emscripten;
extern Mixer* get_global_mixer();


EMSCRIPTEN_BINDINGS(editor) {
    function("getGlobalMixer", &get_global_mixer, allow_raw_pointer<Mixer>());
    class_<Mixer>("Mixer")
        .function("testJsBinding", &Mixer::test_js_binding)
        .function("play", &Mixer::play)
        .function("pause", &Mixer::pause)
        .function("stop", &Mixer::stop)
        .function("getPlaybackState", &Mixer::playback_state)
        .function("resetPlayback", &Mixer::reset_playback)
        .function("setPlaybackPosition", &Mixer::set_playback_position)
        .function("getPlaybackPosition", &Mixer::playback_position)
        .function("getSampleRate", &Mixer::sample_rate)
        .function("setMetronomeEnabled", &Mixer::set_metronome_enabled)
        .function("toggleMetronome", &Mixer::toggle_metronome)
        .function("isMetronomeEnabled", &Mixer::metronome_enabled)
        .function("setMetronomeGainDb", &Mixer::set_metronome_gain_db)
        .function("getMetronomeGainDb", &Mixer::metronome_gain_db)
        .function("setTrackBpm", &Mixer::set_track_bpm)
        .function("getTrackBpm", &Mixer::track_bpm)
        .function("getLeftChannelOutDb", &Mixer::left_channel_out_db)
        .function("getRightChannelOutDb", &Mixer::right_channel_out_db)
        .function("setTrackLength", &Mixer::set_track_length)
        .function("getTrackLength", &Mixer::track_length)
        .function("getStemCount", &Mixer::count_stems)
        .function("updateStemInfo", &Mixer::update_stem_info)
        .function("getWaveformOrdinal", &Mixer::waveform_ordinal)
        .function("getWaveformDataUri", &Mixer::waveform_data_uri)
        .function("toggleMute", &Mixer::toggle_mute)
        .function("toggleSolo", &Mixer::toggle_solo)
        .function("isStemMuted", &Mixer::stem_muted)
        .function("isStemSoloed", &Mixer::stem_soloed)
        .function("getLimiterReductionDb", &Mixer::limiter_reduction_db)
        ;
    value_object<stem_info>("StemInfo")
        .field("id", &stem_info::id)
        .field("path", &stem_info::path)
        .field("samples", &stem_info::samples)
        .field("offset", &stem_info::offset)
        .field("gainDb", &stem_info::gain_db)
        .field("pan", &stem_info::pan)
        ;
    register_vector<stem_info>("VectorStemInfo");
}
