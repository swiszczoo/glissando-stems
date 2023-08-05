import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { styled } from '@mui/system';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import LoadingBar from '../components/LoadingBar';
import Navbar from "../components/Navbar";
import { GreenButton, YellowButton, RedButton } from "../components/NavbarButton";
import SolidBackgroundFrame from "../components/SolidBackgroundFrame";

import { useAxios } from '../hooks/useAxios';
import { useSession } from "../hooks/useSession";
import { AxiosError } from 'axios';
import { useEffect } from 'react';

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
        <span>{props.bpm.toFixed(2)} BPM</span>
      </SongDetails>
      <SongActions>
        <GreenButton><PlayArrowRoundedIcon />&nbsp;Odtwórz</GreenButton>
        <YellowButton><EditRoundedIcon />&nbsp;Edytuj</YellowButton>
        <RedButton><DeleteForeverRoundedIcon />&nbsp;Usuń</RedButton>
      </SongActions>
    </SongFrame>
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
  
  useEffect(() => {
    if ((error as AxiosError)?.response?.status === 403) {
      session.invalidateSession();
    }
  }, [error, session]);

  const handleReload = () => {
    queryClient.invalidateQueries(['songs']);
  };

  return (
    <SolidBackgroundFrame>
      <Navbar title={session.bandName || ''}>
        <GreenButton><AddIcon />&nbsp;Dodaj nowy utwór</GreenButton>
        <span style={{ width: 32 }} />
      </Navbar>
      <MainSection>
        <MainHeader>Lista utworów</MainHeader>
        { status === 'loading' && <LoadingBar/> }
        { status === 'error' && <RedButton onClick={handleReload}>Wczytywanie danych nie powiodło się. Ponów próbę.</RedButton> }
        { status === 'success' && data.map((element: SongResponse) => (
          <Song 
            key={element.id} 
            title={element.title} 
            slug={element.slug} 
            stemCount={element.stemCount} 
            duration={element.duration}
            bpm={element.bpm} />
          )
        )}
      </MainSection>
    </SolidBackgroundFrame>
  );
}

export default SongListRoute;