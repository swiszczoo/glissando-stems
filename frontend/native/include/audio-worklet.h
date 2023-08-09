#pragma once
#include <emscripten/webaudio.h>
#include <memory>

// Forward declarations
struct audio_chunk;
class AudioBuffer;

/**
 * \class
 * \brief Class that acts as a RAII wrapper over Web Audio API's 
 *        AudioContext and AudioWorkletNode
*/
class AudioWorklet {
public:
    AudioWorklet();
    ~AudioWorklet();

    void set_audio_buffer(std::shared_ptr<AudioBuffer> buffer) 
    {
        _audio_buffer = std::move(buffer);
    }

    AudioBuffer* audio_buffer() const
    {
        return _audio_buffer.get();
    }

private:
    EMSCRIPTEN_WEBAUDIO_T _audio_context;
    std::shared_ptr<AudioBuffer> _audio_buffer;

    void process_audio(audio_chunk* output_buffer);

    static void callback_audio_thread_initialized(
        EMSCRIPTEN_WEBAUDIO_T audio_context, EM_BOOL success, void *user_data);
    static void callback_audio_worklet_processor_created(
        EMSCRIPTEN_WEBAUDIO_T audio_context, EM_BOOL success, void *user_data);
    static EM_BOOL callback_process_audio(
        int num_inputs, const AudioSampleFrame *inputs,
        int num_outputs, AudioSampleFrame *outputs,
        int num_params, const AudioParamFrame *params,
        void *user_data);
};

