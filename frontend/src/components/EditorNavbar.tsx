import { styled } from '@mui/system';

import { NormalButton, GreenButton, RedButton, YellowButton } from './NavbarButton';
import Navbar, { NavbarSeparator } from './Navbar';

import BpmIcon from '../assets/icon-bpm.svg';
import TimeIcon from '../assets/icon-time.svg';

import BtnPrevIcon from '../assets/btn-prev.svg';
import BtnPlayIcon from '../assets/btn-play.svg';
import BtnPauseIcon from '../assets/btn-pause.svg';
import BtnStopIcon from '../assets/btn-stop.svg';
import BtnNextIcon from '../assets/btn-next.svg';
import BtnTickIcon from '../assets/btn-tick.svg';

interface FieldWithIconProps {
  iconSrc: string;
  width: number;
}

const FieldWithIconContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  alignItems: 'center',
  '& > img': {
    height: 32,
    width: 'auto',
    marginRight: theme.spacing(0.5),
  }
}));

const FieldWithIconField = styled('div')(({ theme }) => ({
  boxSizing: 'content-box',
  height: 36,
  backgroundColor: theme.palette.background.light,
  display: 'flex',
  placeItems: 'center',
  justifyContent: 'center',
  borderRadius: 36,
  padding: `0px ${theme.spacing(2)}`,
  fontSize: 24,
  fontWeight: 700,
  letterSpacing: 1.5,
}));

function FieldWithIcon(props: React.PropsWithChildren<FieldWithIconProps>) {
  return (
    <FieldWithIconContainer>
      <img src={props.iconSrc}/>
      <FieldWithIconField style={{ minWidth: `${props.width}em` }}>
        {props.children}
      </FieldWithIconField>
    </FieldWithIconContainer>
  );
}

const PlaybackControlsContainer = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  '& button': {
    borderRadius: 0,
    padding: 0,
    height: 36,
    width: 56,
    marginRight: 3,
    '&:first-of-type': {
      borderRadius: '100px 0 0 100px',
    },
    '&:last-of-type': {
      borderRadius: '0 100px 100px 0',
    },
  }
}));

const NormalIcon = styled('img')(() => ({
  filter: 'invert(77%) sepia(11%) saturate(1331%) hue-rotate(177deg) brightness(91%) contrast(87%)',
}));

const GreenIcon = styled('img')(() => ({
  filter: 'invert(44%) sepia(66%) saturate(2759%) hue-rotate(90deg) brightness(100%) contrast(89%)',
}));

const YellowIcon = styled('img')(() => ({
  filter: 'invert(78%) sepia(45%) saturate(3710%) hue-rotate(18deg) brightness(91%) contrast(88%)',
}));

const RedIcon = styled('img')(() => ({
  filter: 'invert(28%) sepia(33%) saturate(3887%) hue-rotate(340deg) brightness(99%) contrast(90%)',
}));

function EditorNavbar() {
  return (
    <Navbar title="Tytuł" customSeparator={true}>
      <NavbarSeparator />
      <PlaybackControlsContainer>
        <NormalButton><NormalIcon src={BtnPrevIcon} /></NormalButton>
        <GreenButton><GreenIcon src={BtnPlayIcon} /></GreenButton>
        <YellowButton><YellowIcon src={BtnPauseIcon} /></YellowButton>
        <RedButton><RedIcon src={BtnStopIcon} /></RedButton>
        <NormalButton><NormalIcon src={BtnNextIcon} /></NormalButton>
        <NormalButton><NormalIcon src={BtnTickIcon} /></NormalButton>
      </PlaybackControlsContainer>
      <span style={{ width: 32 }} />
      <FieldWithIcon iconSrc={TimeIcon} width={12}>
        <span>00:00.000</span>
        <span style={{ flexGrow: 1}} />
        <span>001.1.01</span>
      </FieldWithIcon>
      <span style={{ width: 32 }} />
      <FieldWithIcon iconSrc={BpmIcon} width={4.5}>
        <span>123.456</span>
      </FieldWithIcon>
      <span style={{ width: 32 }} />
    </Navbar>
  );
}

export default EditorNavbar;
