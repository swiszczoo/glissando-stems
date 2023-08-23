import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router';
import { styled } from '@mui/system';

import InstrumentTile from './InstrumentTile';
import MuteSolo from './MuteSolo';
import PlaybackIndicator from './PlaybackIndicator';
import Timeline from './Timeline';

import { useNative } from '../hooks/useNative';
import { useQueryData } from '../hooks/useQueryData';
import { useSession } from '../hooks/useSession';

const EditorTracksContainer = styled('div')(({ theme }) => ({
  flexGrow: 1,
  margin: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
}));

const EditorTracksScrollable = styled('div')(({ theme }) => ({
  overflow: 'hidden scroll',
  scrollbarGutter: 'stable',
  flexBasis: 0,
  flexGrow: 1,
  paddingRight: theme.spacing(1),
}));

const TrackContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  alignItems: 'stretch',
  marginBottom: theme.spacing(1),
}));

const TrackTile = styled(InstrumentTile)(({ theme }) => ({
  width: theme.spacing(9),
  height: theme.spacing(9),
}));

const TrackLabel = styled('div')(({ theme }) => ({
  boxSizing: 'border-box',
  position: 'absolute',
  color: 'white',
  fontSize: 11,
  fontWeight: 700,
  textAlign: 'center',
  bottom: 0,
  width: '100%',
  background: 'rgba(0, 0, 0, 0.5)',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  padding: theme.spacing(0.25),
}));

const WaveformTile = styled(InstrumentTile)(() => ({
  flexGrow: 1,
}));

interface EditorTrackProps {
  stemId: number;
  stemOrdinal: number;
  instrument: string;
  name: string;
}

function EditorTrack(props: EditorTrackProps) {
  return (
    <TrackContainer>
      <TrackTile instrument={props.instrument} icon title={props.name}>
        <TrackLabel>{props.name}</TrackLabel>
      </TrackTile>
      <span style={{ width: 8 }} />
      <MuteSolo/>
      <span style={{ width: 8 }} />
      <WaveformTile instrument={props.instrument}/>
    </TrackContainer>
  );
}

interface StemData {
  id: number;
  name: string;
  instrument: string;
  path: string;
  samples: number;
  gainDecibels: number;
  offset: number;
}

function stemDataToStemInfo(pathPrefix: string, data: StemData): StemInfo {
  return {
    id: data.id,
    gainDb: data.gainDecibels,
    offset: data.offset,
    pan: 0,
    path: pathPrefix + '/' + data.path,
    samples: data.samples,
  };
}

function EditorTracks() {
  const { slug } = useParams();
  const [ native, ] = useNative();
  const data = useQueryData(['stems', slug]) as StemData[];
  const { stemLocationPrefix } = useSession();

  const sortedStems = useMemo(() => data, [data]);

  useEffect(() => {
    const vector = new window.Module.VectorStemInfo();

    data.forEach((item) => vector.push_back(stemDataToStemInfo(stemLocationPrefix!, item)));

    native!.updateStemInfo(vector);
    vector.delete();
  }, [data, native, stemLocationPrefix]);

  return (
    <EditorTracksContainer>
      <Timeline />
      <EditorTracksScrollable>
        {
          sortedStems.map((stem: StemData, index: number) => (
            <EditorTrack 
              key={stem.id} 
              stemId={stem.id}
              stemOrdinal={index}
              instrument={stem.instrument} 
              name={stem.name}/>
          ))
        }
      </EditorTracksScrollable>
      <PlaybackIndicator />
    </EditorTracksContainer>
  )
}

export default EditorTracks;
