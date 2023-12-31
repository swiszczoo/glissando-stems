import { useCallback, useRef, useState } from 'react';
import { styled } from '@mui/system';

import EditIcon from '@mui/icons-material/Edit';

import EditorTimer from './EditorTimer';
import { NormalButton, GreenButton, RedButton, YellowButton } from './NavbarButton';
import Navbar, { NavbarSeparator } from './Navbar';
import SongAddEditModal from './SongAddEditModal';

import BpmIcon from '../assets/icon-bpm.svg';
import TimeIcon from '../assets/icon-time.svg';

import BtnPrevIcon from '../assets/btn-prev.svg';
import BtnPlayIcon from '../assets/btn-play.svg';
import BtnPauseIcon from '../assets/btn-pause.svg';
import BtnStopIcon from '../assets/btn-stop.svg';
import BtnNextIcon from '../assets/btn-next.svg';
import BtnTickIcon from '../assets/btn-tick.svg';

import { useNative } from '../hooks/useNative';
import { usePlaybackUpdate } from '../hooks/usePlaybackUpdate';

import { SongData } from '../routes/Editor';

interface FieldWithIconProps {
  iconSrc: string;
  width: number;
  title?: string;
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
  userSelect: 'none',
}));

function FieldWithIcon(props: React.PropsWithChildren<FieldWithIconProps>) {
  return (
    <FieldWithIconContainer title={props.title}>
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
  'button:not(:disabled).active &, button:not(:disabled):hover:active > &': {
    filter: 'invert(3%) sepia(4%) saturate(6190%) hue-rotate(169deg) brightness(106%) contrast(92%)',
  }
}));

const GreenIcon = styled('img')(() => ({
  filter: 'invert(44%) sepia(66%) saturate(2759%) hue-rotate(90deg) brightness(100%) contrast(89%)',
  'button:not(:disabled).active &, button:not(:disabled):hover:active > &': {
    filter: 'invert(3%) sepia(4%) saturate(6190%) hue-rotate(169deg) brightness(106%) contrast(92%)',
  }
}));

const YellowIcon = styled('img')(() => ({
  filter: 'invert(78%) sepia(45%) saturate(3710%) hue-rotate(18deg) brightness(91%) contrast(88%)',
  'button:not(:disabled).active &, button:not(:disabled):hover:active > &': {
    filter: 'invert(3%) sepia(4%) saturate(6190%) hue-rotate(169deg) brightness(106%) contrast(92%)',
  }
}));

const RedIcon = styled('img')(() => ({
  filter: 'invert(28%) sepia(33%) saturate(3887%) hue-rotate(340deg) brightness(99%) contrast(90%)',
  'button:not(:disabled).active &, button:not(:disabled):hover:active > &': {
    filter: 'invert(100%)',
    opacity: 0.7,
  }
}));

const RoundButton = styled(NormalButton)(({ theme }) => ({
  padding: theme.spacing(1),
}));

function BpmField() {
  const [ bpm, setBpm ] = useState('000.000');

  usePlaybackUpdate(useCallback((mixer: NativeMixer) => {
    setBpm(mixer.getTrackBpm().toFixed(3).padStart(7, '0'));
  }, []));

  return <>{ bpm }</>;
}

interface EditorNavbarProps {
  songData: SongData;
  form: FormType;
}

function EditorNavbar(props: EditorNavbarProps) {
  const [ native, ] = useNative();
  const state = native!.getPlaybackState();
  const [ modalOpen, setModalOpen ] = useState(false);

  const modalKey = useRef(1);

  const handleEditClick = () => {
    ++modalKey.current;
    setModalOpen(true);
  };

  const handlePrev = () => {
    if (native!.getPlaybackState() === 'stop') {
      native!.pause();
    }

    const position = native!.getPlaybackPositionBst();
    const maxBar = position.step < 3 ? (position.bar - 1) : position.bar;

    const targetBar = props.form.reduce((prev, current) => current.bar <= maxBar ? current.bar : prev, -1);
    if (targetBar >= 0) {
      native!.setPlaybackPosition(native!.getBarSample(targetBar) + 1);
    }
  };

  const handlePlay = () => {
    if (state === 'play')
      return;

    native!.play();
    window.audioContext?.resume();
  };

  const handlePause = () => {
    if (state === 'pause')
      return;

    native!.pause();
    window.audioContext?.resume();
  }

  const handleStop = () => {
    if (state === 'stop')
      return;

    native!.stop();
    setTimeout(() => window.audioContext?.suspend(), 100);
  }

  const handleNext = () => {
    if (native!.getPlaybackState() === 'stop') {
      native!.pause();
    }

    const position = native!.getPlaybackPositionBst();
    const minBar = position.bar + 1;

    const targetBar = props.form.reduceRight((prev, current) => current.bar >= minBar ? current.bar : prev, -1);
    if (targetBar >= 0) {
      native!.setPlaybackPosition(native!.getBarSample(targetBar) + 1);
    }
  };

  const handleToggleMetronome = () => {
    native!.toggleMetronome();
  }

  const handleEditCancel = () => {
    setModalOpen(false);
  };

  return (
    <>
      <Navbar title={props.songData.title} customSeparator={true}>
        &nbsp;&nbsp;
        <RoundButton title='Właściwości utworu' onClick={handleEditClick}><EditIcon /></RoundButton>
        <NavbarSeparator />
        <PlaybackControlsContainer>
          <NormalButton title='Poprzednia sekcja' onClick={handlePrev}>
            <NormalIcon src={BtnPrevIcon} />
          </NormalButton>
          <GreenButton title='Odtwarzaj' className={ state === 'play' ? 'active' : '' } onClick={handlePlay}>
            <GreenIcon src={BtnPlayIcon} />
          </GreenButton>
          <YellowButton title='Wstrzymaj odtwarzanie' className={ state === 'pause' ? 'active' : '' } onClick={handlePause}>
            <YellowIcon src={BtnPauseIcon} />
          </YellowButton>
          <RedButton title='Zatrzymaj odtwarzanie' className={ state === 'stop' ? 'active' : '' } onClick={handleStop}>
            <RedIcon src={BtnStopIcon} />
          </RedButton>
          <NormalButton title='Następna sekcja' onClick={handleNext}>
            <NormalIcon src={BtnNextIcon} />
          </NormalButton>
          <NormalButton title='Metronom' className={ native!.isMetronomeEnabled() ? 'active': '' } onClick={handleToggleMetronome}>
            <NormalIcon src={BtnTickIcon} />
          </NormalButton>
        </PlaybackControlsContainer>
        <span style={{ width: 32 }} />
        <FieldWithIcon iconSrc={TimeIcon} width={11} title='Pozycja odtwarzania'>
          <EditorTimer/>
        </FieldWithIcon>
        <span style={{ width: 32 }} />
        <FieldWithIcon iconSrc={BpmIcon} width={4.5} title='Tempo'>
          <BpmField />
        </FieldWithIcon>
        <span style={{ width: 32 }} />
      </Navbar>

      <SongAddEditModal key={modalKey.current} open={modalOpen} songData={props.songData} onCancel={handleEditCancel}/>
    </>
  );
}

export default EditorNavbar;
