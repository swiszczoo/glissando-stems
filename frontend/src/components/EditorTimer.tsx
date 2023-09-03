import { useCallback, useState } from 'react';

import { useNative } from '../hooks/useNative';
import { usePlaybackUpdate } from '../hooks/usePlaybackUpdate';

interface Timestamp {
  time: string;
  bstTime: string;
}

function getTimestamp(sample: number, sampleRate: number, bst: SongPosition): Timestamp {
  const timeInSeconds = sample / sampleRate;

  const minutes = Math.floor(timeInSeconds / 60).toFixed();
  const seconds = (Math.floor(timeInSeconds) % 60).toFixed();
  const millis = (Math.floor(timeInSeconds * 1000) % 1000).toFixed();

  const time = `${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}.${millis.padStart(3, '0')}`;

  const bstTime = `${`${bst.bar}`.padStart(3, '0')}.${bst.step}.${`${bst.tick}`.padStart(2, '0')}`;

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

  usePlaybackUpdate(useCallback((mixer: NativeMixer) => {
    setTimestamp(getTimestamp(mixer.getPlaybackPosition(), sampleRate, mixer.getPlaybackPositionBst()));
  }, [sampleRate]));
  
  return (
    <>
      <span>{ timestamp.time }</span>
      <span style={{ flexGrow: 1 }} />
      <span>{ timestamp.bstTime }</span>
    </>
  );
}

export default EditorTimer;
