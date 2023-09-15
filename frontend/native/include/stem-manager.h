#pragma once
#include <atomic>
#include <functional>
#include <mutex>
#include <optional>
#include <string>
#include <unordered_map>
#include <unordered_set>

#include <vector>


// Forward declarations
struct audio_chunk;


struct stem_info {
    uint32_t id;
    std::string path;
    uint32_t samples;
    int32_t offset;
    double gain_db;
    double pan;
};

/**
 * \class
 * 
 * \brief This class is responsible for project stem management. It fires off
 *        background tasks, handles mute/solo actions and mixes audio.
 */
class StemManager {
public:
    StemManager();

    void set_track_length(uint32_t samples);
    uint32_t track_length() const;

    size_t count_stems() const;

    void toggle_mute(uint32_t stem_id);
    void toggle_solo(uint32_t stem_id);
    void unmute_all();
    bool stem_muted(uint32_t stem_id) const;
    bool stem_soloed(uint32_t stem_id) const;
    bool stem_audible(uint32_t stem_id) const;

    uint32_t waveform_ordinal(uint32_t stem_id) const;
    std::string waveform_data_uri(uint32_t stem_id) const;

    /* Bear in mind that the callback will be called from the worker thread! */
    void set_bg_task_complete_callback(std::function<void()> callback);

    void render(uint32_t first_sample, audio_chunk& chunk);
    void update_stem_info(const std::vector<stem_info>& info);
private:
    struct StemEntry {
        stem_info info;
        std::mutex mutex;
        std::atomic_bool data_ready;
        std::atomic_bool deleted;
        std::atomic_bool error;

        // do not use this string, it only owns 
        // a binary data block, use `.data` instead
        std::string data_block; 
        
        const int16_t* data;
        std::atomic<uint32_t> waveform_ordinal;
        std::string waveform_base64;
    };

    using StemEntryPtr = std::shared_ptr<StemEntry>;

    static const float SHORT_TO_FLOAT;
    static const int STEM_DOWNLOAD_RETRY_COUNT;

    /*
     * Locking strategy: because concurrent reads from STL containers are
     * thread safe, we will only be locking while writing to _stems map and 
     * while reading in the background thread (we assume all writes are
     * performed in the main thread)
    */
    mutable std::mutex _mutex;

    std::atomic<uint32_t> _length;
    std::unordered_map<uint32_t, StemEntryPtr> _stems;
    std::function<void()> _complete_cb;

    std::unordered_set<uint32_t> _muted_stems;
    std::optional<uint32_t> _soloed_stem;

    void switch_to_mute_mode();

    void erase_unused_stems(const std::vector<stem_info>& info);
    void update_or_add_stems(const std::vector<stem_info>& info);
    StemEntryPtr create_stem_from_info(const stem_info& info);

    void run_stem_processing(StemEntryPtr stem);
    void run_waveform_processing(StemEntryPtr stem, uint32_t prev_ordinal);
    void process_stem(StemEntryPtr stem);
    bool decode_vorbis_stream(StemEntryPtr stem, const char* data, uint32_t data_size);
    void process_stem_waveform(StemEntryPtr stem, uint32_t prev_ordinal);
};
