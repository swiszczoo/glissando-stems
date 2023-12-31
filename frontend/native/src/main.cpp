#include <audio-buffer.h>
#include <audio-worklet.h>
#include <mixer.h>

#include <emscripten.h>

#include <iostream>
#include <memory>

#define AUDIO_BUFFER_SIZE 2048

std::unique_ptr<AudioWorklet> g_worklet;
std::unique_ptr<Mixer> g_mixer;

int main() {
    std::cout.sync_with_stdio();
    std::cout << "WASM module is initializing..." << std::endl;

    // Create audio buffer
    std::shared_ptr<AudioBuffer> buffer = std::make_unique<AudioBuffer>(AUDIO_BUFFER_SIZE);

    // Create audio worklet
    g_worklet = std::make_unique<AudioWorklet>();
    g_worklet->set_audio_buffer(buffer);

    // Create mixer
    g_mixer = std::make_unique<Mixer>(buffer);

    EM_ASM({ 
        if (window._wasmInitialized)
            window._wasmInitialized();
    });
    
    std::cout << "WASM module has been initialized!" << std::endl;
    return 0;
}

Mixer* get_global_mixer()
{
    return g_mixer.get();
}
