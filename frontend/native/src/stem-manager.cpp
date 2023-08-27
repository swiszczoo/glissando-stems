#include <stem-manager.h>

#include <audio-buffer.h>
#include <stb_vorbis.h>
#include <utils.h>
#include <waveform-renderer.h>

#include <base64.h>
#include <emscripten/fetch.h>

#include <cassert>
#include <cstdio>
#include <thread>
#include <unordered_set>


const float StemManager::SHORT_TO_FLOAT = 1 / 32768.f;
using std::nullopt;

StemManager::StemManager()
    : _length(0)
{
}

void StemManager::set_track_length(uint32_t samples)
{
    _length = samples;

    for (const auto& [ stem_id, stem_ptr ] : _stems) {
        if (stem_ptr->data_ready) {
            // If the stem is ready, invalidate its waveform image
            // and run a new task to regenerate it

            uint32_t prev_ordinal;
            {
                std::lock_guard lock(stem_ptr->mutex);
                stem_ptr->waveform_base64.clear();
                prev_ordinal = ++stem_ptr->waveform_ordinal;
            }

            run_waveform_processing(stem_ptr, prev_ordinal);
        }
    }
}

uint32_t StemManager::track_length() const
{
    return _length;
}

void StemManager::toggle_mute(uint32_t stem_id)
{
    if (_soloed_stem != nullopt) {
        switch_to_mute_mode();
    }

    std::lock_guard lock(_mutex);
    bool found = _muted_stems.contains(stem_id);
    if (found) {
        _muted_stems.erase(stem_id);
    } else {
        _muted_stems.insert(stem_id);
    }
}

void StemManager::toggle_solo(uint32_t stem_id)
{
    std::lock_guard lock(_mutex);
    bool found = _soloed_stem == stem_id;
    
    _muted_stems.erase(stem_id);

    if (found) {
        _soloed_stem = nullopt;
    } else {
        _soloed_stem = stem_id;
    }
}

bool StemManager::stem_muted(uint32_t stem_id) const
{
    if (_soloed_stem.has_value()) {
        return _soloed_stem.value() != stem_id;
    }

    return _muted_stems.contains(stem_id);
}

bool StemManager::stem_soloed(uint32_t stem_id) const
{
    return _soloed_stem == stem_id;
}

bool StemManager::stem_audible(uint32_t stem_id) const
{
    return !stem_muted(stem_id);
}

uint32_t StemManager::waveform_ordinal(uint32_t stem_id) const
{
    auto it = _stems.find(stem_id);

    if (it == _stems.end()) return 0;
    return it->second->waveform_ordinal;
}

std::string StemManager::waveform_data_uri(uint32_t stem_id) const
{
    auto it = _stems.find(stem_id);

    if (it == _stems.end()) return "";

    std::lock_guard lock(it->second->mutex);
    return it->second->waveform_base64;
}

void StemManager::set_bg_task_complete_callback(std::function<void()> callback)
{
    _complete_cb = callback;
}

void StemManager::render(uint32_t first_sample, audio_chunk& chunk)
{
    std::lock_guard main_lock(_mutex); // <-- this will be called from a worker thread
    for (const auto& [ stem_id, stem_ptr ] : _stems) {
        if (!stem_ptr->data_ready || stem_ptr->deleted) {
            continue;
        }

        if (!stem_audible(stem_id)) {
            continue;
        }

        std::lock_guard lock(stem_ptr->mutex);
        int stem_sample = first_sample - stem_ptr->info.offset;
        int stem_length = stem_ptr->info.samples;
        float gain = Utils::decibels_to_gain(stem_ptr->info.gain_db);
        float pan = stem_ptr->info.pan;
        if (pan < -1.f) pan = -1.f;
        if (pan > 1.f) pan = 1.f;

        // Linear pan law
        float gain_l = 1 - pan;
        float gain_r = 1 + pan;

        for (int i = 0; i < AUDIO_CHUNK_SAMPLES; ++i, ++stem_sample) {
            if (stem_sample < 0 || stem_sample >= stem_length) {
                continue;
            }

            chunk.left_channel[i] 
                += stem_ptr->data[2 * stem_sample] * SHORT_TO_FLOAT * gain * gain_l;
            chunk.right_channel[i] 
                += stem_ptr->data[2 * stem_sample + 1] * SHORT_TO_FLOAT * gain * gain_r;
        }
    }
}

void StemManager::update_stem_info(const std::vector<stem_info>& info)
{
    erase_unused_stems(info);
    update_or_add_stems(info);
}

void StemManager::switch_to_mute_mode()
{
    std::unordered_set<uint32_t> new_muted_stems;
    for (const auto& [ stem_id, stem_ptr ] : _stems) {
        if (stem_muted(stem_id)) {
            new_muted_stems.insert(stem_id);
        }
    }

    std::lock_guard lock(_mutex);
    _muted_stems = std::move(new_muted_stems);
    _soloed_stem = nullopt;
}

void StemManager::erase_unused_stems(const std::vector<stem_info>& info)
{
    std::unordered_set<uint32_t> ids_to_remove;
    for (const auto& [ stem_id, stem_ptr ] : _stems) {
        ids_to_remove.insert(stem_id);
    }

    for (const auto& stem : info) {
        ids_to_remove.erase(stem.id);
    }

    std::lock_guard lock(_mutex); // <-- write access
    for (uint32_t id : ids_to_remove) {
        _stems[id]->deleted = true;
        _stems.erase(id);

        _muted_stems.erase(id);
        if (_soloed_stem == id) {
            _soloed_stem = nullopt;
        }
    }
}

void StemManager::update_or_add_stems(const std::vector<stem_info>& info)
{
    std::vector<StemEntryPtr> stems_to_add;

    for (const auto& stem_info : info) {
        auto stem = _stems.find(stem_info.id);

        if (stem == _stems.end()) {
            stems_to_add.push_back(create_stem_from_info(stem_info));
            continue;
        }

        auto& stem_ptr = stem->second;

        // Redundantly check if something changed because the last thing we
        // want is to carelessly take the mutex and block the audio thread
        if (stem_ptr->info.gain_db != stem_info.gain_db
            || stem_ptr->info.pan != stem_info.pan) {

            std::lock_guard lock(stem_ptr->mutex);
            stem_ptr->info.gain_db = stem_info.gain_db;
            stem_ptr->info.pan = stem_info.pan;
        }

        // invalidate waveform image if offset changed
        if (stem_ptr->info.offset != stem_info.offset) {
            uint32_t prev_ordinal;
            {
                std::lock_guard lock(stem_ptr->mutex);
                stem_ptr->info.offset = stem_info.offset;
                stem_ptr->waveform_base64.clear();
                prev_ordinal = ++stem_ptr->waveform_ordinal;
            }

            run_waveform_processing(stem_ptr, prev_ordinal);
        }
    }

    if (!stems_to_add.empty()) {
        std::lock_guard lock(_mutex); // <-- write access
        for (StemEntryPtr& new_stem : stems_to_add) {
            _stems[new_stem->info.id] = new_stem;
        }
    }
}

auto StemManager::create_stem_from_info(const stem_info& info) -> StemEntryPtr
{
    StemEntryPtr new_stem = std::make_shared<StemEntry>();
    new_stem->info = info;
    new_stem->data = nullptr;
    new_stem->data_block = "";
    new_stem->data_ready = false;
    new_stem->deleted = false;
    new_stem->error = false;
    new_stem->waveform_ordinal = 0;
    new_stem->waveform_base64 = "";

    run_stem_processing(new_stem);

    return new_stem;
}

void StemManager::run_stem_processing(StemEntryPtr stem)
{
    auto cb = _complete_cb;

    std::thread thread([this, stem, cb]() {
        process_stem(stem);
        cb();
    });

    thread.detach();
}

void StemManager::run_waveform_processing(StemEntryPtr stem, uint32_t prev_ordinal)
{
    auto cb = _complete_cb;

    std::thread thread([this, stem, cb, prev_ordinal]() {
        process_stem_waveform(stem, prev_ordinal);
        cb();
    });
    
    thread.detach();
}

void StemManager::process_stem(StemEntryPtr stem)
{
    pthread_t tid = pthread_self();

    printf("Thread %lu: Downloading \"%s\"\n", tid, stem->info.path.c_str());

    emscripten_fetch_attr_t attr;
    emscripten_fetch_attr_init(&attr);
    strcpy(attr.requestMethod, "GET");
    attr.attributes = EMSCRIPTEN_FETCH_LOAD_TO_MEMORY | EMSCRIPTEN_FETCH_SYNCHRONOUS;
    emscripten_fetch_t* fetch = emscripten_fetch(&attr, stem->info.path.c_str());

    if (fetch->status < 200 || fetch->status > 299) {
        fprintf(stderr, "Thread %lu: Download failed!\n", tid);

        stem->error = true;
        return;
    }

    if (stem->deleted) {
        emscripten_fetch_close(fetch);
        return;
    }

    printf("Thread %lu: Download finished. Got %llu bytes. Starting vorbis decoder...\n", 
        tid, fetch->numBytes);

    bool vorbis_ok = decode_vorbis_stream(stem, fetch->data, fetch->numBytes);
    emscripten_fetch_close(fetch);

    if (stem->deleted) return;

    if (vorbis_ok) {
        printf("Thread %lu: Vorbis data has been decoded.\n", tid);

        stem->data_ready = true;
        process_stem_waveform(stem, 0);

        printf("Thread %lu: Initial waveform image has been generated.\n", tid);
    } else {
        fprintf(stderr, "Thread %lu: Vorbis decoding failed!\n", tid);
        stem->error = true;
    }
}

bool StemManager::decode_vorbis_stream(
    StemEntryPtr stem, const char* data, uint32_t data_size)
{
    stem->data_block.resize(2 * stem->info.samples * sizeof(int16_t));

    const unsigned char* in_data = reinterpret_cast<const unsigned char*>(data);
    int16_t* out_data = reinterpret_cast<int16_t*>(stem->data_block.data());
    stem->data = out_data;

    int samples_processed = 0;
    int vorbis_error = 0;
    int limit = 2 * stem->info.samples;

    stb_vorbis* vorbis = stb_vorbis_open_memory(in_data, data_size, &vorbis_error, NULL);
    if (vorbis == nullptr) {
        stem->data_block.clear();
        return false;
    }

    int samples;
    while ((samples = stb_vorbis_get_frame_short_interleaved(
        vorbis, 2, out_data + samples_processed, limit - samples_processed))) {

        samples_processed += 2 * samples;
    }

    stb_vorbis_close(vorbis);
    return samples_processed == limit;
}

void StemManager::process_stem_waveform(StemEntryPtr stem, uint32_t prev_ordinal)
{
    if (!stem->data_ready) {
        assert(false);
        return;
    }

    WaveformRenderer renderer;
    renderer.set_silence_alpha(140);

    int32_t stem_offset;
    uint32_t track_length = _length;
    {
        std::lock_guard lock(stem->mutex);
        stem_offset = stem->info.offset;
    }

    auto png = renderer.render_waveform_to_png(
        stem_offset, track_length, stem->data, stem->info.samples);
    std::string data_uri = "data:image/png;base64," + base64_encode(png.data(), png.size());
    
    {
        std::lock_guard lock(stem->mutex);
        if (stem->waveform_ordinal == prev_ordinal) {
            stem->waveform_base64 = std::move(data_uri);
            ++stem->waveform_ordinal;
        }
    }
}
