interface Window {
  audioContext?: AudioContext;
  _wasmInitialized?: () => void;
  
  Module: EmscriptenModule;
}
