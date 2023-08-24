import { useMemo } from 'react';
import { styled } from '@mui/system';

import { useNative } from '../hooks/useNative';

import { withSeeking } from './withSeeking';

const TimelineContainer = styled('div')(() => ({
  paddingLeft: 136,
  paddingRight: 11,
  overflow: 'hidden',
  scrollbarGutter: 'stable',
}));

const TimelineRoot = withSeeking(styled('div')(({ theme }) => ({
  boxSizing: 'border-box',
  position: 'relative',
  width: '100%',
  height: 54,
  borderBottom: `2px solid ${theme.palette.primary.main}`,
  marginBottom: theme.spacing(1),
})));

const PrimaryBar = styled('div')(({ theme }) => ({
  boxSizing: 'border-box',
  position: 'absolute',
  bottom: 0,
  height: 18,
  borderLeft: `3px solid ${theme.palette.primary.main}`,
  paddingLeft: 2,
  fontSize: 12,
  fontWeight: 900,
  lineHeight: 1.1,
  paddingBottom: 4,
  pointerEvents: 'none',
  userSelect: 'none',
  zIndex: 1,
  transform: 'translateX(-1.5px)',
}));

const SecondaryBar = styled('div')(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  height: 18,
  borderLeft: `2px solid ${theme.palette.primary.dark}`,
  pointerEvents: 'none',
  zIndex: 0,
  transform: 'translateX(-1px)',
}));

const FormMarkerBar = styled('div')(({ theme }) => ({
  boxSizing: 'border-box',
  position: 'absolute',
  bottom: 0,
  height: 36,
  borderLeft: `3px solid ${theme.palette.primary.main}`,
  userSelect: 'none',
  zIndex: 2,
  transform: 'translateX(-1.5px)',
}));

const FormMarkerFlag = styled('div')(({ theme }) => ({
  boxSizing: 'border-box',
  position: 'absolute',
  left: -1, 
  top: 0,
  maxWidth: 75,
  fontSize: 13,
  fontWeight: 900,
  paddingTop: 0,
  paddingLeft: 2,
  paddingRight: 8,
  lineHeight: 1.1,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

interface FormMarkerProps {
  left: string;
  name: string;
}

function FormMarker(props: FormMarkerProps) {
  return (
    <>
      <FormMarkerBar style={{ left: props.left }}>
        <FormMarkerFlag title={props.name}>{props.name}</FormMarkerFlag>
      </FormMarkerBar>
    </>
  )
}

function calcBarPositionsFromBpm(bpm: number, sampleRate: number, totalSamples: number): number[]
{
  const samplesPerBar = sampleRate * 60 / bpm * 4;
  const bars: number[] = [];
  let position = 0;

  while (position < totalSamples) {
    bars.push(Math.round(position));
    position += samplesPerBar;
  }

  return bars;
}

function Timeline() {
  const [ native, ] = useNative();
  const bpm = native!.getTrackBpm();
  const sampleRate = native!.getSampleRate();
  const trackLength = native!.getTrackLength();

  const barLines = useMemo(() => {
    const barPositions = calcBarPositionsFromBpm(bpm, sampleRate, trackLength);

    return barPositions.map((position, index) => {
      const style = { left: `${position / trackLength * 100}%`};
      if (index % 4 === 0) return <PrimaryBar key={index} style={style}>{index + 1}</PrimaryBar>
      else return <SecondaryBar key={index} style={style} />
    });
  }, [bpm, sampleRate, trackLength]);


  return (
    <TimelineContainer>
      <TimelineRoot>
        { barLines }
      </TimelineRoot>
    </TimelineContainer>
  );
}

export default Timeline;
