import { forwardRef } from 'react';
import { styled } from '@mui/system';

const makeGradient = (hue: number, saturation: number, valueGain: number) => {
  const color = (value: number) => `hsl(${hue} ${saturation}% ${value * valueGain}%)`;
  return `linear-gradient(to bottom, ${color(50)} 0%, ${color(25)} 6%, ${color(12)} 94%, black 100%)`;
};

const GRADIENT_PERCUSSION = makeGradient(0, 0, 1);

interface InstrumentTileProps {
  instrument: string;
  icon?: boolean;
  className?: string;
  title?: string;
}

const InstrumentTileBase = styled('div')(({ theme }) => ({
  border: '3px solid black',
  borderBottomColor: theme.palette.background.light,
  position: 'relative',
}));

const InstrumentTile = forwardRef((props: React.PropsWithChildren<InstrumentTileProps>, ref: React.ForwardedRef<HTMLDivElement>) => {
  return (
    <InstrumentTileBase 
      ref={ref} 
      style={{ background: GRADIENT_PERCUSSION }} 
      className={props.className}
      title={props.title}>
        {props.children}
    </InstrumentTileBase>
  );
});

export default InstrumentTile;
