import { useCallback, useState } from 'react';
import { styled } from '@mui/system';

import { usePlaybackUpdate } from '../hooks/usePlaybackUpdate';

const playbackIndicatorColor = '#0f0';

const PlaybackContainer = styled('div')(() => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  scrollbarGutter: 'stable',
  pointerEvents: 'none',
}));

const PlaybackBarHolder = styled('div')(() => ({
  position: 'absolute',
  left: 135,
  right: 11,
  height: '100%',
}));

const PlaybackBar = styled('div')(({ theme }) => ({
  position: 'absolute',
  width: 2,
  height: '100%',
  background: playbackIndicatorColor || theme.palette.primary.main,
  transform: 'translateX(-50%) translateZ(0)',
  boxShadow: `0 0 0px 2px ${theme.palette.background.main}`,
  zIndex: 100,
}));

const PlaybackBarTip = styled('div')(({ theme }) => ({
  position: 'absolute',
  left: 1,
  width: 20,
  height: 12,
  background: playbackIndicatorColor || theme.palette.primary.main,
  transform: 'translateX(-50%) translateZ(0)',
  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
}));

function PlaybackIndicator() {
  const [ position, setPosition ] = useState<number | undefined>(undefined);

  usePlaybackUpdate(useCallback((mixer: NativeMixer) => {
    if (mixer.getPlaybackState() === 'stop') {
      setPosition(undefined);
    } else {
      setPosition(mixer.getPlaybackPosition() / mixer.getTrackLength());
    }
  }, []));

  return (
    <>
      { position !== undefined &&
        <PlaybackContainer>
          <PlaybackBarHolder>
            <PlaybackBar style={{ left: `${position * 100}%` }}>
              <PlaybackBarTip />
            </PlaybackBar>
          </PlaybackBarHolder>
        </PlaybackContainer>
      }
    </>
  );
}

export default PlaybackIndicator;
