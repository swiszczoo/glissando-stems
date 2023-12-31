import { useCallback, useState } from 'react';
import { styled } from '@mui/system';

import { usePlaybackUpdate } from '../hooks/usePlaybackUpdate';

const PeakMeterContainer = styled('div')(({ theme }) => ({
  boxSizing: 'border-box',
  padding: theme.spacing(2),
  borderLeft: `1px solid ${theme.palette.background.light}`,
  display: 'flex',
  flexDirection: 'column'
}));

const PeakMeterLegend = styled('div')(({ theme }) => ({
  display: 'inline-block',
  fontWeight: 700,
  minWidth: theme.spacing(4),
  textAlign: 'center',
}));

const PeakMeterLimiter = styled('div')(() => ({
  fontWeight: 900,
  width: '100%',
  textAlign: 'center',
  color: '#d13b32',
}));

const PeakMeterBarContainer = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  alignItems: 'stretch',
  height: '100%',
}));

const PeakMeterBarBg = styled('div')(({ theme }) => ({
  position: 'relative',
  height: '100%',
  width: theme.spacing(3),
  margin: `0 ${theme.spacing(0.5)}`,
  background: theme.palette.background.light,
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
}));

const PeakMeterBarFg = styled('div')(() => ({
  position: 'absolute',
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  background: 'linear-gradient(to bottom, #ff0000 4.4%, #d13b32 4.4%, #acad0f 15%, #0fad0f 30%)',
}));

const PeakMeterScaleContainer = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  position: 'absolute', 
  left: 0, 
  top: 0, 
  width: '100%', 
  height: '100%',
}));

const PeakMeterScale = styled('div')(({ theme }) => ({
  fontWeight: 900,
  fontSize: 11,
  width: '90%',
  textAlign: 'right',
  overflow: 'hidden',
  flexGrow: 1,
  flexBasis: 0,
  borderTop: `1px solid ${theme.palette.primary.dark}40`,
}));

const scaleValues = [...Array(23).keys()].map((val) => (val - 1) * -3);

interface PeakMeterBarProps {
  valueDb: number;
}

function PeakMeterBar(props: PeakMeterBarProps) {
  const percentage = ((-props.valueDb + 3) / 69 * 100);
  const topBorder = Math.max(0, Math.min(percentage, 100)) + '%';

  return (
    <>
      <PeakMeterBarBg>
        <PeakMeterBarFg 
          style={{ clipPath: `polygon(0 ${topBorder}, 100% ${topBorder}, 100% 100%, 0% 100%)`}}
          />
      </PeakMeterBarBg>
    </>
  );
}

interface PeakMeterBarsProps {
  leftDb: number;
  rightDb: number;
}

function PeakMeterBars(props: PeakMeterBarsProps) {
  return (
    <PeakMeterBarContainer>
      <PeakMeterBar valueDb={props.leftDb}/>
      <PeakMeterBar valueDb={props.rightDb}/>
    </PeakMeterBarContainer>
  );
}

function PeakMeter() {
  const [ limiterReduction, setLimiterReduction ] = useState(0);
  const [ db, setDb ] = useState([-100, -100]);

  usePlaybackUpdate(useCallback((mixer: NativeMixer) => {
    if (mixer.getPlaybackState() === 'stop') {
      setLimiterReduction(0);
      setDb([-100, -100]);
    } else {
      setLimiterReduction(mixer.getLimiterReductionDb());
      setDb([mixer.getLeftChannelOutDb(), mixer.getRightChannelOutDb()]);
    }
  }, []));

  const limiterOpacity = Math.min(1, 0.2 - Math.min(0, (limiterReduction + 1) / 2));

  return (
    <PeakMeterContainer>
      <PeakMeterLimiter style={{ opacity: limiterOpacity }}>&#x25cf; LIMITER</PeakMeterLimiter>
      <div>
        <PeakMeterLegend>L</PeakMeterLegend>
        <PeakMeterLegend>R</PeakMeterLegend>
        <PeakMeterLegend>dBTP</PeakMeterLegend>
      </div>
      <div style={{ position: 'relative', flexGrow: 1 }}>
        <PeakMeterBars leftDb={db[0]} rightDb={db[1]}/>
        <PeakMeterScaleContainer>
          { scaleValues.map((value) => <PeakMeterScale key={value}>{value}</PeakMeterScale>)}
        </PeakMeterScaleContainer>
      </div>
    </PeakMeterContainer>
  );
}

export default PeakMeter;
