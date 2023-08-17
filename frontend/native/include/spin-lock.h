#include <atomic>

class SpinLock
{
private:
    std::atomic_flag _lock_flag;

public:
    SpinLock()
    {
    }

    void lock()
    {
        while(_lock_flag.test_and_set(std::memory_order_acquire)) { }
    }

    bool try_lock()
    {
        return !_lock_flag.test_and_set(std::memory_order_acquire);
    }

    void unlock()
    {
        _lock_flag.clear();
    }
};
