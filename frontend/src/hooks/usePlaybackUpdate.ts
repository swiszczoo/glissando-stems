import { useEffect } from 'react';

import useNative from './useNative';

function usePlaybackUpdate(fun: (mixer: NativeMixer) => void) {
  const [ native, ] = useNative();

  useEffect(() => {
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
  }, [native, fun]);
}

export default usePlaybackUpdate;
