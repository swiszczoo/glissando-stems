add_library(cpp-base64 STATIC
    cpp-base64/base64.cpp
    cpp-base64/base64.h
)
target_include_directories(cpp-base64 INTERFACE cpp-base64)
