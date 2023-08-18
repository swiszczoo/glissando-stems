import { useCallback, useState } from 'react';

import { useNative } from '../hooks/useNative';
import { usePlaybackUpdate } from '../hooks/usePlaybackUpdate';

interface Timestamp {
  time: string;
  bstTime: string;
}

function getTimestamp(sample: number, sampleRate: number, bpm: number): Timestamp {
  const timeInSeconds = sample / sampleRate;

  const minutes = Math.floor(timeInSeconds / 60).toFixed();
  const seconds = (Math.floor(timeInSeconds) % 60).toFixed();
  const millis = (Math.floor(timeInSeconds * 1000) % 1000).toFixed();

  const time = `${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}.${millis.padStart(3, '0')}`;

  const timeInBeats = timeInSeconds / 60 * bpm;
  const bars = (Math.floor(timeInBeats / 4) + 1).toFixed();
  const steps = (Math.floor(timeInBeats) % 4 + 1).toFixed();
  const ticks = (Math.floor(timeInBeats * 4) % 16 + 1).toFixed();

  const bstTime = `${bars.padStart(3, '0')}.${steps}.${ticks.padStart(2, '0')}`;

  return {
    time,
    bstTime
  };
}

function EditorTimer() {
  const [ native, ] = useNative();
  const [ timestamp, setTimestamp ] = useState<Timestamp>({
    time: '--:--.---',
    bstTime: '---.-.---',
  });

  const sampleRate = native?.getSampleRate() || 0;
  const bpm = native?.getTrackBpm() || 120.0;

  usePlaybackUpdate(useCallback((mixer: NativeMixer) => {
    setTimestamp(getTimestamp(mixer.getPlaybackPosition(), sampleRate, bpm));
  }, [bpm, sampleRate]));
  
  return (
    <>
      <span>{ timestamp.time }</span>
      <span style={{ flexGrow: 1 }} />
      <span>{ timestamp.bstTime }</span>
    </>
  );
}

export default EditorTimer;
