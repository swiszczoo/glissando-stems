interface Window {
  audioContext?: AudioContext;
  _wasmInitialized?: () => void;
  
  Module: EmscriptenModule;
}

interface NativeMixer {
  testJsBinding: () => number,
  play: () => void,
  pause: () => void,
  stop: () => void,
  getPlaybackState: () => 'play' | 'pause' | 'stop',
  resetPlayback: () => void,
  setPlaybackPosition: (sampleNum: number) => void,
  getPlaybackPosition: () => number,
  getSampleRate: () => number,
}
