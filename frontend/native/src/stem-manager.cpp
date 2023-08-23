#include <stem-manager.h>

#include <audio-buffer.h>
#include <stb_vorbis.h>
#include <utils.h>

#include <emscripten/fetch.h>

#include <cassert>
#include <iostream>
#include <thread>
#include <unordered_set>


const float StemManager::SHORT_TO_FLOAT = 1 / 32768.f;

StemManager::StemManager()
{
}

void StemManager::render(uint32_t first_sample, audio_chunk& chunk)
{
    for (const auto& stem : _stems) {
        auto stem_ptr = stem.second;
        if (!stem_ptr->data_ready || stem_ptr->deleted) {
            continue;
        }

        std::lock_guard lock(stem_ptr->mutex);
        int stem_sample = first_sample - stem_ptr->info.offset;
        int stem_length = stem_ptr->info.samples;
        float gain = Utils::decibelsToGain(stem_ptr->info.gain_db);
        float pan = stem_ptr->info.pan;
        if (pan < -1.f) pan = -1.f;
        if (pan > 1.f) pan = 1.f;

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

void StemManager::erase_unused_stems(const std::vector<stem_info>& info)
{
    std::unordered_set<uint32_t> ids_to_remove;
    for (const auto& stem : _stems) {
        ids_to_remove.insert(stem.first);
    }

    for (const auto& stem : info) {
        ids_to_remove.erase(stem.id);
    }

    std::lock_guard lock(_mutex);
    for (uint32_t id : ids_to_remove) {
        _stems[id]->deleted = true;
        _stems.erase(id);
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
            || stem_ptr->info.offset != stem_info.offset
            || stem_ptr->info.pan != stem_info.pan) {

            std::lock_guard lock(stem_ptr->mutex);
            stem_ptr->info.gain_db = stem_info.gain_db;
            stem_ptr->info.offset = stem_info.offset;
            stem_ptr->info.pan = stem_info.pan;
        }
    }

    if (!stems_to_add.empty()) {
        std::lock_guard lock(_mutex);
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
    std::thread thread(std::bind(&StemManager::process_stem, this, stem));
    thread.detach();
}

void StemManager::run_waveform_processing(StemEntryPtr stem)
{
    std::thread thread(std::bind(&StemManager::process_stem_waveform, this, stem));
    thread.detach();
}

void StemManager::process_stem(StemEntryPtr stem)
{
    std::cout << "Thread " << std::this_thread::get_id() 
              << ": Downloading \"" << stem->info.path << '\"' << std::endl;

    emscripten_fetch_attr_t attr;
    emscripten_fetch_attr_init(&attr);
    strcpy(attr.requestMethod, "GET");
    attr.attributes = EMSCRIPTEN_FETCH_LOAD_TO_MEMORY | EMSCRIPTEN_FETCH_SYNCHRONOUS;
    emscripten_fetch_t* fetch = emscripten_fetch(&attr, stem->info.path.c_str());

    if (fetch->status < 200 || fetch->status > 299) {
        std::cerr << "Thread " << std::this_thread::get_id() 
                  << ": Download failed!" << std::endl;

        stem->error = true;
        return;
    }

    if (stem->deleted) {
        emscripten_fetch_close(fetch);
        return;
    }

    std::cout << "Thread " << std::this_thread::get_id()
              << ": Download finished. Got " << fetch->numBytes << " bytes. " 
              << "Starting vorbis decoder..." << std::endl;

    bool vorbis_ok = decode_vorbis_stream(stem, fetch->data, fetch->numBytes);
    emscripten_fetch_close(fetch);

    if (stem->deleted) return;

    if (vorbis_ok) {
        std::cout << "Thread " << std::this_thread::get_id()
                  << ": Vorbis data has been decoded." << std::endl;
        stem->data_ready = true;
        process_stem_waveform(stem);
    } else {
        std::cerr << "Thread " << std::this_thread::get_id() 
                  << ": Vorbis decoding failed!" << std::endl;
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

void StemManager::process_stem_waveform(StemEntryPtr stem)
{
    if (!stem->data_ready) {
        assert(false);
        return;
    }
}
