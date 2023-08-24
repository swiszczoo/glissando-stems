import { useCallback, useEffect } from 'react';
import { useParams } from 'react-router';
import { styled } from '@mui/system';
import { useQuery } from '@tanstack/react-query';

import Logo from '../assets/logo.svg';

import EditorNavbar from '../components/EditorNavbar';
import EditorTracks from '../components/EditorTracks';
import LoadingBar from '../components/LoadingBar';
import PeakMeter from '../components/PeakMeter';
import SolidBackgroundFrame from '../components/SolidBackgroundFrame';

import { useAxios } from '../hooks/useAxios';
import { useNative } from '../hooks/useNative';
import { usePlaybackUpdate } from '../hooks/usePlaybackUpdate';


interface SongData {
  id: number;
  slug: string;
  title: string;
  bpm: number;
  duration: number;
  samples: number;
  stemCount: number;
  form: { bar: number; name: string }[];
}


const Frame = styled('div')(({ theme }) => `
  box-sizing: border-box;
  margin: auto;
  width: 500px;
  max-width: 95vw;
  padding: ${theme.spacing(4)};
  border-radius: ${theme.spacing(2)};
  display: flex;
  flex-direction: column;
  align-items: center;
`);

const ContentContainer = styled('section')(() => ({
  flexGrow: 1,
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  alignItems: 'stretch',
}));

function LoaderContent() {
  return (
    <Frame>
      <img src={Logo} style={{ width: '100%' }}/>
      <br/>
      <LoadingBar/>
      <p>Trwa ładowanie edytora... Proszę czekać</p>
    </Frame>
  );
}

interface PlaybackStateChangeDetectorProps {
  currentState: string;
}

function PlaybackStateChangeDetector(props: PlaybackStateChangeDetectorProps) {
  const [ , invalidateNative ] = useNative();
  const { currentState } = props;

  usePlaybackUpdate(useCallback((mixer: NativeMixer) => {
    const playbackState = mixer.getPlaybackState();
    if (playbackState != currentState) {
      invalidateNative();
      
      if (playbackState === 'stop') {
        setTimeout(() => window.audioContext?.suspend(), 100);
      }
    }
  }, [currentState, invalidateNative]));

  return <></>;
}

interface EditorContentProps {
  song: SongData;
}

function EditorContent(props: EditorContentProps) {
  const [ native, ] = useNative();
  const { bpm, samples, title } = props.song;

  useEffect(() => {
    native!.setTrackBpm(bpm);
    native!.setTrackLength(samples);
  }, [bpm, native, samples]);

  return (
    <>
      <EditorNavbar songTitle={title} songBpm={bpm}/>
      <ContentContainer>
        <EditorTracks/>
        <PeakMeter />
        { /* <PlaybackStateChangeDetector currentState={native!.getPlaybackState()}/> */ }
      </ContentContainer>
    </>
  );
}

function EditorRoute() {
  const { slug } = useParams();
  const axios = useAxios();
  const [ native, ] = useNative();
  const songQuery = useQuery(['songs', slug], async () => {
    const { data } = await axios.get(`/api/songs/by-slug/${slug}`);
    return data;
  }, { staleTime: Infinity });

  const stemQuery = useQuery(['stems', slug], async () => {
    const { data } = await axios.get(`/api/songs/by-slug/${slug}/stems`);
    return data;
  }, { staleTime: Infinity });

  const loading = (
    !native 
    || songQuery.status !== 'success' 
    || stemQuery.status !== 'success'
  );

  return (
    <SolidBackgroundFrame>
      { loading && <LoaderContent /> }
      { !loading && <EditorContent song={songQuery.data}/> }
    </SolidBackgroundFrame>
  );
}

export default EditorRoute;