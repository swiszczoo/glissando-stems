import { styled } from "@mui/system";

const SolidBackgroundFrame = styled('main')(({ theme }) => ({
  minHeight: '100vh',
  width: '100%',
  background: theme.palette.background.main,
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'nowrap',
  alignItems: 'center',
}));

export default SolidBackgroundFrame;