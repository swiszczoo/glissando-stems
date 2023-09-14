interface Window {
  audioContext?: AudioContext;
  _wasmInitialized?: () => void;
  _invalidateModuleContext?: () => void;
  
  Module: GlissandoModule;
}

interface GlissandoModule extends EmscriptenModule {
  getGlobalMixer: () => NativeMixer;
  VectorTempoTag: typeof CppVector<TempoTag>;
  VectorStemInfo: typeof CppVector<StemInfo>;
}

// Corresponding definition in frontend/native/include/stem-manager.h
interface StemInfo {
  id: number;
  path: string;
  samples: number;
  offset: number;
  gainDb: number;
  pan: number;
}

// Corresponding definition in frontend/native/include/tempo.h
interface SongPosition {
  bar: number;
  step: number;
  tick: number;
}

// Corresponding definition in frontend/native/include/tempo.h
interface TempoTag {
  sample: number;
  bar: number;
  timeSignatureNumerator: number;
}

declare class EmscriptenDisposable {
  delete: () => void;
}

declare class CppVector<T> extends EmscriptenDisposable {
  constructor();

  get: (index: number) => T;
  push_back: (element: T) => void;
  resize: (newSize: number, element: T) => void;
  set: (index: number, value: T) => void;
  size: () => number;
}

interface NativeMixer {
  testJsBinding: () => number;
  play: () => void;
  pause: () => void;
  stop: () => void;
  getPlaybackState: () => 'play' | 'pause' | 'stop';
  resetPlayback: () => void;
  setPlaybackPosition: (sampleNum: number) => void;
  getPlaybackPosition: () => number;
  getPlaybackPositionBst: () => SongPosition;
  getBarSample: (bar: number) => number;
  getSampleRate: () => number;
  setMetronomeEnabled: (enabled: boolean) => void;
  toggleMetronome: () => void;
  isMetronomeEnabled: () => boolean;
  setMetronomeGainDb: (decibels: number) => void;
  getMetronomeGainDb: () => number;
  setTrackBpm: (bpm: number, timeSignatureNumerator?: number) => void;
  setTrackVaryingBpm: (tags: CppVector<TempoTag>) => void;
  getTrackBpm: () => number;
  getTrackTimeSignature: () => number;
  getLeftChannelOutDb: () => number;
  getRightChannelOutDb: () => number;
  setTrackLength: (samples: number) => void;
  getTrackLength: () => number;
  getStemCount: () => number;
  updateStemInfo: (info: CppVector<StemInfo>) => void;
  getWaveformOrdinal: (stemId: number) => number;
  getWaveformDataUri: (stemId: number) => string;
  toggleMute: (stemId: number) => void;
  toggleSolo: (stemId: number) => void;
  unmuteAll: () => void;
  isStemMuted: (stemId: number) => boolean;
  isStemSoloed: (stemId: number) => boolean;
  getLimiterReductionDb: () => number;
}

type FormType = { bar: number; name: string; }[];
type TempoType = { sample: number; bar: number; timeSigNum: number }[];
