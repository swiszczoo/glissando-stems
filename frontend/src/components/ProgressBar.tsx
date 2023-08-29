import { styled } from "@mui/system";

const ProgressBarBackground = styled('div')(({ theme }) => `
    margin-top: ${theme.spacing(4)};
    height: ${theme.spacing(1)};
    border-radius: ${theme.spacing(1)};
    width: 100%;
    background-color: ${theme.palette.background.light};
    animation: stripesAnimation 7s linear infinite;
    box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.4);
`);

const ProgressBarFill = styled('div')(({ theme }) => `
  height: 100%;
  background-color: ${theme.palette.primary.main};
  border-radius: ${theme.spacing(1)};
  transition: 0.5s width;
  min-width: ${theme.spacing(1)};
  max-width: 100%;
`);

interface ProgressBarProps {
  value: number;
  enabled?: boolean;
}

function ProgressBar(props: ProgressBarProps) {
  return (
    <ProgressBarBackground>
      { props.enabled && <ProgressBarFill style={{ width: `${props.value * 100}%` }} /> }
    </ProgressBarBackground>
  );
}

export default ProgressBar;