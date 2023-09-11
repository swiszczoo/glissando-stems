import { styled } from '@mui/system';

const SliderBox = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  alignItems: 'center',
  '& > div': {
    whiteSpace: 'nowrap',
    minWidth: 100,
    textAlign: 'right',
    fontSize: 20,
    fontWeight: 700,
  }
}));

export default SliderBox;
