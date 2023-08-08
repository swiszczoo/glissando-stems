#include <audio-worklet.h>
#include <emscripten/webaudio.h>

#include <iostream>

uint8_t audio_thread_stack[4096];
static const int AUDIO_CHUNK_SAMPLES = 128;
static const char* WORKLET_NODE_NAME = "glissando-processor";
static int OUTPUT_CHANNEL_COUNT = 2; // Stereo output

float test = 0.1;

struct audio_chunk {
    float left_channel[AUDIO_CHUNK_SAMPLES];
    float right_channel[AUDIO_CHUNK_SAMPLES];
};

EM_BOOL audio_process(int num_inputs, const AudioSampleFrame *inputs,
                      int num_outputs, AudioSampleFrame *outputs,
                      int num_params, const AudioParamFrame *params,
                      void *user_data)
{
    audio_chunk* output = reinterpret_cast<audio_chunk*>(outputs[0].data);
    for (int i = 0; i < AUDIO_CHUNK_SAMPLES; ++i) {
        output->left_channel[i] = emscripten_random() * test - 0.05;
        output->right_channel[i] = emscripten_random() * test - 0.05;
    }

    return EM_TRUE;
}

EM_BOOL OnCanvasClick(int eventType, const EmscriptenMouseEvent *mouseEvent, void *userData)
{
  std::cout << "Click!" << std::endl;
  return EM_FALSE;
}

static void audio_worklet_processor_created(EMSCRIPTEN_WEBAUDIO_T audio_context, EM_BOOL success, void *user_data)
{
    if (!success) return;

    EmscriptenAudioWorkletNodeCreateOptions options = {
        .numberOfInputs = 0,
        .numberOfOutputs = 1,
        .outputChannelCounts = &OUTPUT_CHANNEL_COUNT,
    };

    EMSCRIPTEN_AUDIO_WORKLET_NODE_T wasm_audio_worklet = emscripten_create_wasm_audio_worklet_node(
        audio_context, WORKLET_NODE_NAME, &options, audio_process, nullptr);

    EM_ASM({
        emscriptenGetAudioObject($0).connect(emscriptenGetAudioObject($1).destination);
        window.audioContext = emscriptenGetAudioObject($1);
    }, wasm_audio_worklet, audio_context);

    emscripten_set_click_callback("body", NULL, 0, OnCanvasClick);
}

static void audio_thread_initialized(EMSCRIPTEN_WEBAUDIO_T audio_context, EM_BOOL success, void *user_data)
{
    if (!success) return;
    
    WebAudioWorkletProcessorCreateOptions opts = {
        .name = WORKLET_NODE_NAME,
        .numAudioParams = 0,
    };

    emscripten_create_wasm_audio_worklet_processor_async(
        audio_context, &opts, audio_worklet_processor_created, nullptr);
}

void test_audio_worklet() {
    EMSCRIPTEN_WEBAUDIO_T context = emscripten_create_audio_context(nullptr);

    emscripten_start_wasm_audio_worklet_thread_async(
        context, audio_thread_stack, sizeof(audio_thread_stack), &audio_thread_initialized, nullptr);
}
