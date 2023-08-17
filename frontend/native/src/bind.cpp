#include <mixer.h>

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
        ;
}
