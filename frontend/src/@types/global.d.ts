interface Window {
  audioContext?: AudioContext;
  _wasmInitialized?: () => void;
  _invalidateModuleContext?: () => void;
  
  Module: EmscriptenModule;
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

interface SongPosition {
  bar: number;
  step: number;
  tick: number;
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
  setTrackVaryingBpm: (tags: TempoType[]) => void;
  getTrackBpm: () => number;
  getLeftChannelOutDb: () => number;
  getRightChannelOutDb: () => number;
  setTrackLength: (samples: number) => void;
  getTrackLength: () => number;
  getStemCount: () => number;
  updateStemInfo: (info: StemInfo[]) => void;
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
