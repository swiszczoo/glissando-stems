#include <audio-worklet.h>

#include <audio-buffer.h>
#include <emscripten/webaudio.h>


uint8_t audio_thread_stack[4096];
static const char* WORKLET_NODE_NAME = "glissando-processor";
static int OUTPUT_CHANNEL_COUNT = 2; // Stereo output


AudioWorklet::AudioWorklet() 
{
    EmscriptenWebAudioCreateAttributes options = {
        .latencyHint = "interactive",
        .sampleRate = AUDIO_SAMPLE_RATE,
    };

    EMSCRIPTEN_WEBAUDIO_T context = emscripten_create_audio_context(&options);
    _audio_context = context;

    emscripten_start_wasm_audio_worklet_thread_async(
        context, audio_thread_stack, sizeof(audio_thread_stack), 
        &AudioWorklet::callback_audio_thread_initialized, this);
}

AudioWorklet::~AudioWorklet()
{
    emscripten_destroy_audio_context(_audio_context);
}

void AudioWorklet::process_audio(audio_chunk* output_buffer)
{
    if (_audio_buffer && (*_audio_buffer) >> (*output_buffer)) {
        return;
    }

    for (int i = 0; i < AUDIO_CHUNK_SAMPLES; ++i) {
        output_buffer->left_channel[i] = 0;
        output_buffer->right_channel[i] = 0;
    }
}

void AudioWorklet::callback_audio_thread_initialized(
    EMSCRIPTEN_WEBAUDIO_T audio_context, EM_BOOL success, void *user_data)
{
    if (!success) return;
    
    WebAudioWorkletProcessorCreateOptions opts = {
        .name = WORKLET_NODE_NAME,
        .numAudioParams = 0,
    };

    emscripten_create_wasm_audio_worklet_processor_async(
        audio_context, &opts, 
        &AudioWorklet::callback_audio_worklet_processor_created, user_data);
}

void AudioWorklet::callback_audio_worklet_processor_created(
    EMSCRIPTEN_WEBAUDIO_T audio_context, EM_BOOL success, void *user_data)
{
    if (!success) return;

    EmscriptenAudioWorkletNodeCreateOptions options = {
        .numberOfInputs = 0,
        .numberOfOutputs = 1,
        .outputChannelCounts = &OUTPUT_CHANNEL_COUNT,
    };

    EMSCRIPTEN_AUDIO_WORKLET_NODE_T wasm_audio_worklet = emscripten_create_wasm_audio_worklet_node(
        audio_context, WORKLET_NODE_NAME, &options, 
        &AudioWorklet::callback_process_audio, user_data);

    // Setup audio path
    EM_ASM({
        const audioCtx = emscriptenGetAudioObject($1);
        const clipperNode = new WaveShaperNode(audioCtx, {
            curve: new Float32Array([-1, 1]),
        });
        // ^----- Apply clipping
        const gainNode = new GainNode(audioCtx);
        gainNode.gain.setValueAtTime(0.85, audioCtx.currentTime); 
        // ^---- Windows mixer tries to apply its own limiting,
        // especially if upsampling. Give him a bit of a headroom...

        emscriptenGetAudioObject($0).connect(clipperNode);
        clipperNode.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        window.audioContext = audioCtx;
        console.info(`Output sample rate is ${window.audioContext.sampleRate} Hz`);

    }, wasm_audio_worklet, audio_context);
}

EM_BOOL AudioWorklet::callback_process_audio(int num_inputs, const AudioSampleFrame *inputs,
                      int num_outputs, AudioSampleFrame *outputs,
                      int num_params, const AudioParamFrame *params,
                      void *user_data)
{
    AudioWorklet* instance = reinterpret_cast<AudioWorklet*>(user_data);
    audio_chunk* output_buffer = reinterpret_cast<audio_chunk*>(outputs[0].data);
    
    instance->process_audio(output_buffer);
    return EM_TRUE;
}

