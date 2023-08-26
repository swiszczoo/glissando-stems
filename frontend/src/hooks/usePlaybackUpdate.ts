import { useEffect } from 'react';

import { useNative } from './useNative';

export function usePlaybackUpdate(fun: (mixer: NativeMixer) => void) {
  const nativeData = useNative();

  useEffect(() => {
    const [ native, ] = nativeData;
    if (!native)
      return;

    const shouldContinue = (state: string) => state === 'play' || state === 'pause';
    let effectKilled = false;

    if (shouldContinue(native.getPlaybackState()) && !effectKilled) {
      const handler = () => {
        fun(native);
        if (shouldContinue(native.getPlaybackState()) && !effectKilled) {
          window.requestAnimationFrame(handler);
        }
      };

      handler();
    } else {
      // Call it just once to update state
      fun(native);
    }

    return () => {
      effectKilled = true;
    };
  }, [nativeData, fun]);
}

