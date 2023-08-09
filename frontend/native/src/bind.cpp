#include <mixer.h>

#include <emscripten/bind.h>

using namespace emscripten;
extern Mixer* get_global_mixer();


EMSCRIPTEN_BINDINGS(editor) {
    function("get_global_mixer", &get_global_mixer, allow_raw_pointer<Mixer>());
    class_<Mixer>("Mixer")
        .function("test_js_binding", &Mixer::test_js_binding);
}
