cmake_minimum_required(VERSION 3.11)
project(glissandostems)

option(GS_WASM_PATH_PREFIX DEFAULT "")

set(EXECUTABLE_NAME glissando-editor)
set(CMAKE_CXX_STANDARD 14)

file(GLOB_RECURSE C_SOURCES src/*.c)
file(GLOB_RECURSE CXX_SOURCES src/*.cpp)

if(CMAKE_BUILD_TYPE STREQUAL "Debug")
    set(GS_OPTIMIZATION_LEVEL -O0)
else()
    set(GS_OPTIMIZATION_LEVEL -O3)
endif()

add_executable(${EXECUTABLE_NAME} ${C_SOURCES} ${CXX_SOURCES})
target_include_directories(${EXECUTABLE_NAME} PUBLIC include)
target_compile_options(${EXECUTABLE_NAME} PRIVATE -pthread -O3)
target_link_options(${EXECUTABLE_NAME} PRIVATE 
    ${GS_OPTIMIZATION_LEVEL} -sMODULARIZE=0 -sWASM=1 -sPTHREAD_POOL_SIZE=navigator.hardwareConcurrency 
    -sEXPORT_ES6=0 -sENVIRONMENT=web,worker -sAUDIO_WORKLET=1 -sWASM_WORKERS=1 -sEXPORTED_RUNTIME_METHODS=wasmTable -o /native/build/glissando-editor.js)

string(REPLACE "/" "\\/" GS_WASM_PATH_PREFIX ${GS_WASM_PATH_PREFIX})

add_custom_command(TARGET ${EXECUTABLE_NAME} POST_BUILD 
    COMMAND sed -i'' "\"s/\\([\\(]['\\\"]\\)\\(glissando-editor\\.\\)/\\1${GS_WASM_PATH_PREFIX}\\2/\"" ${CMAKE_BINARY_DIR}/glissando-editor.js)
