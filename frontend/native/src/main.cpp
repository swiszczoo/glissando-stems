#include <audio-buffer.h>
#include <audio-worklet.h>
#include <emscripten.h>

#include <iostream>
#include <memory>

#define AUDIO_BUFFER_SIZE 2048

std::unique_ptr<AudioWorklet> g_worklet;

static EM_BOOL test(int eventType, const EmscriptenMouseEvent *mouseEvent, void *userData) {
    printf("Undeflow count is %d\n", reinterpret_cast<AudioBuffer*>(userData)->underflow_count());
    return EM_FALSE;
}

int main() {
    std::cout << "WASM module is initializing..." << std::endl;

    // Create audio buffer
    std::shared_ptr<AudioBuffer> buffer = std::make_unique<AudioBuffer>(AUDIO_BUFFER_SIZE);

    // Create audio worklet
    g_worklet = std::make_unique<AudioWorklet>();
    g_worklet->set_audio_buffer(buffer);

    EM_ASM({ 
        if (window._wasmInitialized)
            window._wasmInitialized();
    });
    
    std::cout << "WASM module has been initialized!" << std::endl;

    emscripten_set_click_callback("body", buffer.get(), false, &test);
    return 0;
}
