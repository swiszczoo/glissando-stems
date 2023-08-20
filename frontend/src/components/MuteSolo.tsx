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
  mute?: boolean,
  solo?: boolean,
  onMute?: () => void,
  onSolo?: () => void,
}

function MuteSolo(props: MuteSoloProps) {
  return (
    <MuteSoloContainer>
      <RedButton className={props.mute ? 'active' : ''} title='Wycisz' onClick={props.onMute}>M</RedButton>
      <GreenButton className={props.solo ? 'active' : ''} title='Solo' onClick={props.onSolo}>S</GreenButton>
    </MuteSoloContainer>
  );
}

export default MuteSolo;
