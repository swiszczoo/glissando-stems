import { useEffect } from 'react';
import { useParams } from 'react-router';
import { styled } from '@mui/system';
import { useQuery } from '@tanstack/react-query';

import Logo from '../assets/logo.svg';

import EditorNavbar from '../components/EditorNavbar';
import LoadingBar from '../components/LoadingBar';
import SolidBackgroundFrame from '../components/SolidBackgroundFrame';

import { useAxios } from '../hooks/useAxios';
import { useNative } from '../hooks/useNative';


interface SongData {
  id: number;
  slug: string;
  title: string;
  bpm: number;
  duration: number;
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

interface EditorContentProps {
  song: SongData;
}

function EditorContent(props: EditorContentProps) {
  const [ native, ] = useNative();
  const { bpm, title } = props.song;

  useEffect(() => {
    native!.setTrackBpm(bpm);
  }, [bpm, native]);

  return (
    <>
      <EditorNavbar songTitle={title} songBpm={bpm}/>
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
  });

  const loading = !native || songQuery.status != 'success';

  return (
    <SolidBackgroundFrame>
      { loading && <LoaderContent /> }
      { !loading && <EditorContent song={songQuery.data}/> }
    </SolidBackgroundFrame>
  );
}

export default EditorRoute;