cmake_minimum_required(VERSION 3.11)
project(glissandostems)

set(EXECUTABLE_NAME glissando-editor)
set(CMAKE_CXX_STANDARD 14)

file(GLOB_RECURSE C_SOURCES src/*.c)
file(GLOB_RECURSE CXX_SOURCES src/*.cpp)

add_executable(${EXECUTABLE_NAME} ${C_SOURCES} ${CXX_SOURCES})
target_include_directories(${EXECUTABLE_NAME} PUBLIC include)
target_compile_options(${EXECUTABLE_NAME} PRIVATE -pthread -O3)
target_link_options(${EXECUTABLE_NAME} PRIVATE 
    -O3 -sMODULARIZE=1 -sWASM=1 -sPTHREAD_POOL_SIZE=navigator.hardwareConcurrency 
    -sENVIRONMENT=web -s EXPORT_ES6=1)
