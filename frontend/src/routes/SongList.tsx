import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { AxiosError } from 'axios';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { styled } from '@mui/system';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import Input from '../components/Input';
import LoadingBar from '../components/LoadingBar';
import Modal from '../components/Modal';
import Navbar from "../components/Navbar";
import { GreenButton, YellowButton, RedButton } from "../components/NavbarButton";
import SolidBackgroundFrame from "../components/SolidBackgroundFrame";

import { useAxios } from '../hooks/useAxios';
import { useSession } from "../hooks/useSession";

function reversed<T>(array: T[]): T[] {
  return array.slice().reverse();
}

const MainSection = styled('section')(({ theme }) => ({
  boxSizing: 'border-box',
  padding: `0px ${theme.spacing(4)}`,
  width: 1100,
  maxWidth: '100%',
}));

const MainHeader = styled('h1')(() => ({
  fontSize: 36,
}));

const SongFrame = styled('div')(({ theme }) => ({
  boxSizing: 'border-box',
  background: theme.palette.background.light,
  padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  transition: '0.1s',
}));

const SongTitle = styled('h2')(({ theme }) => ({
  margin: 0,
  marginBottom: theme.spacing(0.5),
  fontWeight: 700,
  fontSize: 24,
}));

const SongDetails = styled('div')(({ theme }) => ({
  fontSize: 18,
  display: 'flex',
  alignItems: 'center',
  '*': {
    marginRight: theme.spacing(0.5),
    letterSpacing: 1,
  },
  marginBottom: theme.spacing(1),
}));

const SongActions = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  'button': {
    margin: theme.spacing(0.5),
    background: theme.palette.background.hover,
  },
}));

interface SongProps {
  slug: string;
  title: string;
  bpm: number;
  stemCount: number;
  duration: number;
  onPlay?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

interface SongResponse extends SongProps {
  id: number;
}

function Song(props: SongProps) {
  const roundedDuration = Math.round(props.duration);
  const minutes = Math.floor(roundedDuration / 60);
  const seconds = roundedDuration % 60;
  const time = minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');

  return (
    <SongFrame>
      <SongTitle>{props.title}</SongTitle>
      <SongDetails>
        <LibraryMusicIcon titleAccess='Liczba ścieżek' />
        <span>{props.stemCount}</span>
        <span></span>
        <AccessTimeIcon titleAccess='Czas trwania' />
        <span>{time}</span>
        <span></span>
        <HourglassTopRoundedIcon titleAccess='Tempo' />
        <span>{props.bpm.toFixed(3)} BPM</span>
      </SongDetails>
      <SongActions>
        <GreenButton onClick={props.onPlay} disabled={props.stemCount < 1}>
          <PlayArrowRoundedIcon />&nbsp;Odtwarzacz
        </GreenButton>
        <YellowButton onClick={props.onEdit}>
          <EditRoundedIcon />&nbsp;Edytor
        </YellowButton>
        <RedButton onClick={props.onDelete}>
          <DeleteForeverRoundedIcon />&nbsp;Usuń
        </RedButton>
      </SongActions>
    </SongFrame>
  );
}

const TempoFrame = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  alignItems: 'baseline',
  justifyContent: 'center',
  '*': {
    marginRight: theme.spacing(0.5)
  },
  '* input': {
    width: theme.spacing(4),
    padding: `${theme.spacing(1.5)} ${theme.spacing(0)}`,
    fontWeight: 700,
    textAlign: 'center',
  }
}));

interface ModalProps {
  open?: boolean;
  onCancel?: () => void;
}

function AddSongModal(props: ModalProps) {
  const [ title, setTitle ] = useState('');
  const [ tempo, setTempo ] = useState('120.000');
  const [ processing, setProcessing ] = useState(false);
  const axios = useAxios();
  const session = useSession();
  const queryClient = useQueryClient();

  const handleTempoKeyDown = (charIdx: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    const nextInputId = `bpm${charIdx}`;
    const digits = '0123456789';
    const digit = digits.indexOf(event.key);

    if (digit >= 0) {
      setTempo((currentTempo) => currentTempo.substring(0, charIdx) + digit + currentTempo.substring(charIdx + 1));
      const nextInput = document.querySelector<HTMLInputElement>(`div[data-focusafter=${nextInputId}] > input`);
      nextInput?.focus();
      setTimeout(() => nextInput?.select(), 0);
    }
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value.substring(0, 255));
  };

  const valid = title.length > 0 && tempo >= '040.000' && !processing;

  const handleAccept = () => {
    if (!valid) return;
    setProcessing(true);

    axios.post('/api/songs', {
      title: title,
      bpm: parseFloat(tempo),
      form: [],
    }).then(() => {
      queryClient.invalidateQueries(['songs']);
      setProcessing(false);

      if (props.onCancel) props.onCancel();
    }).catch((error: AxiosError) => {
      setProcessing(false);

      if (error.response) {
        if (error.response.status === 403) {
          session.invalidateSession();
        } else {
          console.error(error);
          alert((error.response.data as Record<string, string>)['message']);
        }
      } else {
        console.error(error);
        alert('Nie można dodać utworu! Wystąpił nieznany błąd.');
      }
    });
  };

  return (
    <Modal open={props.open} onBlur={props.onCancel} title='Dodaj nowy utwór' buttons={() =>
      <>
        <RedButton onClick={props.onCancel}><CloseRoundedIcon />&nbsp;Anuluj</RedButton>&nbsp;&nbsp;
        <GreenButton onClick={handleAccept} disabled={!valid}>
          <CheckRoundedIcon />{ processing ? '\u2022 \u2022 \u2022' : <>&nbsp;Zaakceptuj</> }
        </GreenButton>
      </>
    }>
      <Input value={title} placeholder='Tytuł utworu' onChange={handleTitleChange}/>
      <TempoFrame>
        <span>Tempo:&nbsp;&nbsp;</span>
        <Input onKeyDown={handleTempoKeyDown.bind(null, 0)} value={tempo[0]}></Input>
        <Input data-focusafter='bpm0' onKeyDown={handleTempoKeyDown.bind(null, 1)} value={tempo[1]}></Input>
        <Input data-focusafter='bpm1' onKeyDown={handleTempoKeyDown.bind(null, 2)} value={tempo[2]}></Input>
        <span style={{ fontWeight: 700 }}>.</span>
        <Input data-focusafter='bpm2' onKeyDown={handleTempoKeyDown.bind(null, 4)} value={tempo[4]}></Input>
        <Input data-focusafter='bpm4' onKeyDown={handleTempoKeyDown.bind(null, 5)} value={tempo[5]}></Input>
        <Input data-focusafter='bpm5' onKeyDown={handleTempoKeyDown.bind(null, 6)} value={tempo[6]}></Input>
        <span style={{ fontWeight: 700 }}>BPM</span>
      </TempoFrame>
    </Modal>
  );
}

function DeleteSongModal(props: ModalProps & { songId: number, songTitle: string }) {
  const [ processing, setProcessing ] = useState(false);
  const axios = useAxios();
  const session = useSession();
  const queryClient = useQueryClient();

  const handleDelete = () => {
    setProcessing(true);

    axios.delete(`/api/songs/${props.songId}`).then(() => {
      queryClient.invalidateQueries(['songs']);
      setProcessing(false);

      if (props.onCancel) props.onCancel();
    }).catch((error: AxiosError) => {
      setProcessing(false);

      if (error.response) {
        if (error.response.status === 403) {
          session.invalidateSession();
        } else {
          console.error(error);
          alert((error.response.data as Record<string, string>)['message']);
        }
      } else {
        console.error(error);
        alert('Nie można dodać utworu! Wystąpił nieznany błąd.');
      }
    });
  };

  return (
    <Modal open={props.open} onBlur={props.onCancel} title='Potwierdź usunięcie utworu' buttons={() =>
      <>
        <RedButton onClick={props.onCancel}><CloseRoundedIcon />&nbsp;Nie</RedButton>&nbsp;&nbsp;
        <GreenButton onClick={handleDelete}>
          <CheckRoundedIcon /> { processing ? '\u2022 \u2022 \u2022' : <>&nbsp;Tak</> }
        </GreenButton>
      </>
    }>
      <p>Czy na pewno chcesz usunąć utwór pt. <strong>"{ props.songTitle }"</strong>? Tej operacji nie można cofnąć!</p>
    </Modal>
  );
}

function SongListRoute() {
  const axios = useAxios();
  const queryClient = useQueryClient();
  const { status, data, error } = useQuery(['songs'], async () => {
    const { data } = await axios.get('/api/songs');
    return data;
  }, { staleTime: 60000 });
  const session = useSession();
  const navigate = useNavigate();
  const modalKey = useRef<number>(1);
  const [ addModalOpen, setAddModalOpen ] = useState(false);
  const [ deleteModalSongId, setDeleteModalSongId ] = useState<number | undefined>(undefined);
  const deleteModalSongTitle = useMemo(() => {
    if (deleteModalSongId === undefined) return '';

    for (const entry of data) {
      if (entry.id === deleteModalSongId) {
        return entry.title;
      }
    }

    return '';
  }, [data, deleteModalSongId]);
  
  useEffect(() => {
    if ((error as AxiosError)?.response?.status === 403) {
      session.invalidateSession();
    }
  }, [error, session]);

  const handleAddModalOpen = () => {
    ++modalKey.current;
    setAddModalOpen(true);
  };

  const handleAddModalClose = () => {
    setAddModalOpen(false);
  }

  const handleReload = () => {
    queryClient.invalidateQueries(['songs']);
  };

  const handleSongEdit = (songId: number) => {
    for (const entry of data) {
      if (entry.id === songId) {
        navigate(`edit/${entry.slug}`);
        return;
      }
    }
  };

  const handleSongDelete = (songId: number) => {
    setDeleteModalSongId(songId);
  };

  const handleDeleteModalClose = () => {
    setDeleteModalSongId(undefined);
  };

  return (
    <SolidBackgroundFrame>
      <Navbar title={session.bandName || ''}>
        <GreenButton onClick={handleAddModalOpen}><AddIcon />&nbsp;Dodaj nowy utwór</GreenButton>
        <span style={{ width: 32 }} />
      </Navbar>
      <MainSection>
        <MainHeader>Lista utworów</MainHeader>
        { status === 'loading' && <LoadingBar/> }
        { status === 'error' && <RedButton onClick={handleReload}>Wczytywanie danych nie powiodło się. Ponów próbę.</RedButton> }
        { status === 'success' && reversed<SongResponse>(data).map((element: SongResponse) => (
          <Song
            key={element.id} 
            title={element.title} 
            slug={element.slug} 
            stemCount={element.stemCount} 
            duration={element.duration}
            bpm={element.bpm}
            onEdit={handleSongEdit.bind(null, element.id)}
            onDelete={handleSongDelete.bind(null, element.id)} />
          )
        )}
        { status === 'success' && data.length === 0 && <>Obecnie nie ma w systemie żadnych utworów!</>}
      </MainSection>
      <AddSongModal 
        key={modalKey.current} 
        open={addModalOpen} 
        onCancel={handleAddModalClose} />
      <DeleteSongModal 
        key={-modalKey.current} 
        open={deleteModalSongId !== undefined} 
        songId={deleteModalSongId!} 
        songTitle={deleteModalSongTitle} 
        onCancel={handleDeleteModalClose} />
    </SolidBackgroundFrame>
  );
}

export default SongListRoute;
