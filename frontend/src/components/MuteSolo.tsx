import { styled } from '@mui/system';

import { GreenButton, RedButton } from './NavbarButton';

const MuteSoloContainer = styled('div')(() => ({
  '& button': {
    borderRadius: 0,
    padding: 0,
    height: 35,
    width: 36,
    fontSize: 25,
    marginRight: 3,
    '&:first-of-type': {
      borderRadius: '100px 100px 0 0',
      marginBottom: 2,
    },
    '&:last-of-type': {
      borderRadius: '0 0 100px 100px',
    },
  }
}));

interface MuteSoloProps {
  mute?: boolean;
  solo?: boolean;
  onMute?: () => void;
  onMuteDoubleClick?: () => void;
  onSolo?: () => void;
  onSoloDoubleClick?: () => void;
}

function MuteSolo(props: MuteSoloProps) {
  const handleMuteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (event.detail === 2) {
      if (props.onMuteDoubleClick) {
        props.onMuteDoubleClick();
        return;
      }
    }

    if (props.onMute) {
      props.onMute();
    }
  };

  const handleSoloClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (event.detail === 2) {
      if (props.onSoloDoubleClick) {
        props.onSoloDoubleClick();
        return;
      }
    }

    if (props.onSolo) {
      props.onSolo();
    }
  };


  return (
    <MuteSoloContainer>
      <RedButton className={props.mute ? 'active' : ''} title='Wycisz' onClick={handleMuteClick}>M</RedButton>
      <GreenButton className={props.solo ? 'active' : ''} title='Solo' onClick={handleSoloClick}>S</GreenButton>
    </MuteSoloContainer>
  );
}

export default MuteSolo;
