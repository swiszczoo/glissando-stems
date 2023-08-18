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
  setMetronomeEnabled: (enabled: boolean) => void,
  toggleMetronome: () => void,
  isMetronomeEnabled: () => boolean,
  setMetronomeGainDb: (decibels: number) => void,
  getMetronomeGainDb: () => number,
  setTrackBpm: (bpm: number) => void,
  getTrackBpm: () => number,
}
