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
  paddingRight: 2,
  fontSize: 12,
  fontWeight: 900,
  lineHeight: 1.1,
  paddingBottom: 4,
  pointerEvents: 'none',
  userSelect: 'none',
  zIndex: 1,
  letterSpacing: -1,
  '&.plus100': {
    letterSpacing: -1.5,
  },
  '&:before': {
    content: '""',
    background: theme.palette.background.main,
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '70%',
    zIndex: -1,
  },
}));

const SecondaryBar = styled('div')(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  height: 18,
  borderLeft: `2px solid ${theme.palette.primary.dark}`,
  pointerEvents: 'none',
  zIndex: 0,
}));

const FormMarkerBar = styled('div')(({ theme }) => ({
  boxSizing: 'border-box',
  position: 'absolute',
  bottom: 0,
  height: 36,
  borderLeft: `3px solid ${theme.palette.primary.main}`,
  userSelect: 'none',
  zIndex: 2,
}));

const FormMarkerFlag = styled('div')(({ theme }) => ({
  boxSizing: 'border-box',
  position: 'absolute',
  left: -1, 
  top: 0,
  maxWidth: 75,
  fontSize: 13,
  fontWeight: 900,
  paddingLeft: 2,
  paddingRight: 8,
  lineHeight: 1.2,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  cursor: 'pointer',
}));

interface FormMarkerProps {
  position: number;
  name: string;
}

function FormMarker(props: FormMarkerProps) {
  const [ native, ] = useNative();

  const handleClick = () => {
    if (native!.getPlaybackState() === 'stop') {
      native!.pause();
    }

    native!.setPlaybackPosition(props.position * native!.getTrackLength() + 1);
  };

  return (
    <>
      <FormMarkerBar style={{ left: `${props.position * 100}%` }}>
        <FormMarkerFlag onClick={handleClick} title={props.name}>{props.name}</FormMarkerFlag>
      </FormMarkerBar>
    </>
  )
}

function calcBarPositionsFromBpm(bpm: number, sampleRate: number, totalSamples: number): number[] {
  const samplesPerBar = sampleRate * 60 / bpm * 4;
  const bars: number[] = [];
  let position = 0;

  while (position < totalSamples) {
    bars.push(Math.round(position));
    position += samplesPerBar;
  }

  return bars;
}

function calcBarPositionsForVaryingBpm(tempo: TempoType, totalSamples: number): number[] {
  const bars: number[] = [];

  let prev = tempo[0];
  let lastSamplesPerBar = 0;
  
  for (const current of tempo.slice(1)) {
    const samplesPerBar = (current.sample - prev.sample) / (current.bar - prev.bar);
    let position = prev.sample

    for (let bar = prev.bar; bar < current.bar; bar++) {
      bars.push(position);
      position += samplesPerBar;
    }

    prev = current;
    lastSamplesPerBar = samplesPerBar;
  }

  let position = prev.sample;
  while (position < totalSamples) {
    bars.push(Math.round(position));
    position += lastSamplesPerBar;
  }

  return bars;
}

interface TimelineProps {
  form: FormType;
  tempo?: TempoType;
}

function Timeline(props: TimelineProps) {
  const [ native, ] = useNative();
  const bpm = native!.getTrackBpm();
  const sampleRate = native!.getSampleRate();
  const trackLength = native!.getTrackLength();

  const barPositions = useMemo(() => {
    if (!props.tempo) {
      return calcBarPositionsFromBpm(bpm, sampleRate, trackLength);
    } else {
      return calcBarPositionsForVaryingBpm(props.tempo, trackLength);
    }
  }, [bpm, trackLength, sampleRate, props.tempo]);

  const barLines = useMemo(() => {
    return barPositions.map((position, index) => {
      const style = { left: `${position / trackLength * 100}%`};
      const primaryClassName = (index + 1 >= 100) ? 'plus100' : '';
      if (index % 4 === 0) return <PrimaryBar className={primaryClassName} key={index} style={style}>{index + 1}</PrimaryBar>
      else return <SecondaryBar key={index} style={style} />
    });
  }, [barPositions, trackLength]);

  const formMarkers = useMemo(() => (
    props.form.map((marker) => {
      if (barPositions[marker.bar - 1] === undefined) return undefined;

      const position = barPositions[marker.bar - 1] / trackLength;
      return <FormMarker key={marker.name} position={position} name={marker.name} />;
    })
  ), [barPositions, props.form, trackLength]);

  return (
    <TimelineContainer>
      <TimelineRoot>
        { barLines }
        { formMarkers }
      </TimelineRoot>
    </TimelineContainer>
  );
}

export default Timeline;
