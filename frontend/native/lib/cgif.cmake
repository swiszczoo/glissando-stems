add_library(cgif STATIC
    cgif/src/cgif.c
    cgif/src/cgif_raw.c
)
target_include_directories(cgif PRIVATE cgif/inc)
target_include_directories(cgif INTERFACE cgif/inc)
