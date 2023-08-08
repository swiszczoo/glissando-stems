#include <audio-worklet.h>
#include <emscripten.h>

#include <iostream>

int main() {
    std::cout << "WASM module has been loaded!" << std::endl;
    test_audio_worklet();
    EM_ASM({ if (window._wasmInitialized) { window._wasmInitialized(); } });
    
    return 0;
}
