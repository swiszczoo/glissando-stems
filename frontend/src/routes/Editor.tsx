import { useCallback, useEffect } from 'react';
import { useParams } from 'react-router';
import { styled } from '@mui/system';
import { useQuery } from '@tanstack/react-query';

import Logo from '../assets/logo.svg';

import EditorNavbar from '../components/EditorNavbar';
import EditorTracks, { StemData } from '../components/EditorTracks';
import LoadingBar from '../components/LoadingBar';
import PeakMeter from '../components/PeakMeter';
import SolidBackgroundFrame from '../components/SolidBackgroundFrame';

import { useAxios } from '../hooks/useAxios';
import { useNative } from '../hooks/useNative';
import { usePlaybackUpdate } from '../hooks/usePlaybackUpdate';
// import { useSession } from '../hooks/useSession';


interface SongData {
  id: number;
  slug: string;
  title: string;
  bpm: number;
  duration: number;
  samples: number;
  stemCount: number;
  form: FormType;
  varyingTempo?: TempoType;
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

interface MediaSessionHandlerProps {
  songTitle: string;
  bandName: string;
}

function MediaSessionHandler(props: MediaSessionHandlerProps) {
  const [ native, ] = useNative();

  const playbackState = native!.getPlaybackState();

  useEffect(() => {
    if (playbackState === 'play') navigator.mediaSession.playbackState = 'playing';
    if (playbackState === 'pause') navigator.mediaSession.playbackState = 'paused';
    if (playbackState === 'stop') navigator.mediaSession.playbackState = 'none';

    navigator.mediaSession.metadata = new MediaMetadata({
      title: props.songTitle,
      artist: props.bandName,
      album: '',
      artwork: [],
    });

    navigator.mediaSession.setActionHandler('play', () => native!.play());
    navigator.mediaSession.setActionHandler('pause', () => native!.pause());
    navigator.mediaSession.setActionHandler('stop', () => native!.stop());

    return () => {
      navigator.mediaSession.playbackState = 'none';
    };
  }, [props.bandName, props.songTitle, native, playbackState]);

  useEffect(() => {
    navigator.mediaSession.setPositionState({
      playbackRate: 1,
      duration: native!.getTrackLength() / native!.getSampleRate(),
      position: native!.getPlaybackPosition() / native!.getSampleRate(),
    });
  });

  return <></>;
}

interface EditorContentProps {
  song: SongData;
  stems: StemData[];
}

function playbackStateToUnicode(state: string) {
  if (state === 'play') return '\u25b6\ufe0f ';
  if (state === 'pause') return '\u23f8 ';
  if (state === 'stop') return '\u23f9 ';

  return '';
}

function EditorContent(props: EditorContentProps) {
  const [ native, ] = useNative();
  // const { bandName } = useSession();
  const { bpm, samples, title, form, varyingTempo } = props.song;

  const playbackState = native?.getPlaybackState() || 'stop';

  useEffect(() => {
    if (bpm !== null) {
      native!.setTrackBpm(bpm);
    } else {
      const vector = new window.Module.VectorTempoTag();

      varyingTempo!.forEach((data) => {
        vector.push_back({
          sample: data.sample,
          bar: data.bar,
          timeSignatureNumerator: data.timeSigNum,
        });
      });

      native!.setTrackVaryingBpm(vector);
      vector.delete();
    }
    native!.setTrackLength(samples);
  }, [bpm, native, samples, varyingTempo]);

  useEffect(() => {
    
    document.title = `${playbackStateToUnicode(playbackState)}${title} \u2013 Glissando Stems`;
  }, [playbackState, title]);

  return (
    <>
      <EditorNavbar songTitle={title} form={form} />
      <ContentContainer>
        <EditorTracks songName={title} form={form} data={props.stems} tempo={props.song.varyingTempo}/>
        <PeakMeter />
      </ContentContainer>
      { /* <PlaybackStateChangeDetector currentState={native!.getPlaybackState()}/> */ }
      { /* Waiting till Audio Session API */}
      { /* 'mediaSession' in navigator && <MediaSessionHandler songTitle={title} bandName={bandName!}/> */ }
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
      { !loading && <EditorContent key={slug} song={songQuery.data} stems={stemQuery.data}/> }
    </SolidBackgroundFrame>
  );
}

export default EditorRoute;