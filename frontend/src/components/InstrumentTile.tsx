import { forwardRef } from 'react';
import { styled } from '@mui/system';

import { InstrumentCategory, InstrumentMap, UnknownInstrument } from '../data/instruments';

const makeGradient = (hue: number, saturation: number, valueGain: number) => {
  const color = (value: number) => `hsl(${hue} ${saturation}% ${value * valueGain}%)`;
  return `linear-gradient(to bottom, ${color(50)} 0%, ${color(25)} 6%, ${color(12)} 94%, black 100%)`;
};

const categoryGradients: Map<InstrumentCategory, string> = new Map();
categoryGradients.set(InstrumentCategory.UNKNOWN, makeGradient(200, 30, 0.8));
categoryGradients.set(InstrumentCategory.PERCUSSION, makeGradient(0, 0, 1));
categoryGradients.set(InstrumentCategory.BASS_GUITAR, makeGradient(270, 60, 1.1));
categoryGradients.set(InstrumentCategory.BRASS, makeGradient(45, 100, 1.3));
categoryGradients.set(InstrumentCategory.CHROMATIC_PERCUSSION, makeGradient(160, 40, 0.8));
categoryGradients.set(InstrumentCategory.GUITAR, makeGradient(350, 100, 1.2));
categoryGradients.set(InstrumentCategory.KEYS, makeGradient(110, 80, 1));
categoryGradients.set(InstrumentCategory.STRINGS, makeGradient(130, 100, 0.5));
categoryGradients.set(InstrumentCategory.VOCAL, makeGradient(220, 90, 1.3));

interface InstrumentTileProps {
  instrument: string;
  icon?: boolean;
  className?: string;
  title?: string;
  tabIndex?: number;
  onClick?: () => void;
}

const InstrumentTileBase = styled('div')(({ theme }) => ({
  border: '3px solid black',
  borderBottomColor: theme.palette.background.light,
  position: 'relative',
}));

const InstrumentIcon = styled('img')(() => ({
  position: 'absolute',
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  filter: 'invert(100%)'
}));

const InstrumentTile = forwardRef((props: React.PropsWithChildren<InstrumentTileProps>, ref: React.ForwardedRef<HTMLDivElement>) => {
  const instrumentData = InstrumentMap[props.instrument] || UnknownInstrument;
  const background = categoryGradients.get(instrumentData.category);

  return (
    <InstrumentTileBase 
      ref={ref} 
      style={{ background }} 
      className={props.className}
      title={props.title}
      onClick={props.onClick}
      tabIndex={props.tabIndex}>
        { props.icon && instrumentData.iconSrc.length > 0 && <InstrumentIcon src={instrumentData.iconSrc}/>}
        {props.children}
    </InstrumentTileBase>
  );
});

export default InstrumentTile;
