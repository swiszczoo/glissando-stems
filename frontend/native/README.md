# Building in Docker

First, in the root folder (with Docker Compose script), run:
```
docker compose -f docker-compose-dev.yml --profile emscripten build
```

This will build an additional Docker container named `glissando_emsdk`.

Then, in this directory (`native`), run this command to configure CMake project:
```
docker run --rm -v .:/project glissando_emsdk /bin/sh -c "mkdir build; cd build; cmake --preset emscripten-release .."
```
Available presets are `emscripten-debug`, `emscripten-release` and `emscripten-deploy`.

And finally, to actually build the project, run:
```
docker run --rm -v .:/project glissando_emsdk cmake --build ./build
```
