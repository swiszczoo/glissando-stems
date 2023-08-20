import { forwardRef } from 'react';
import { styled } from '@mui/system';

const makeGradient = (hue: number, saturation: number) => {
  const color = (value: number) => `hsl(${hue} ${saturation}% ${value}%)`;
  return `linear-gradient(to bottom, ${color(50)} 0%, ${color(30)} 6%, ${color(15)} 96%, black 100%)`;
};

const GRADIENT_PERCUSSION = makeGradient(0, 0);

interface InstrumentTileProps {
  instrument: string;
  icon?: boolean;
  className?: string;
  title?: string;
}

const InstrumentTileBase = styled('div')(() => ({
  border: '1px solid black',
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
