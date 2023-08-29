import { useCallback, useEffect, useMemo } from 'react';
import { styled } from '@mui/system';

import InstrumentTile from './InstrumentTile';
import MuteSolo from './MuteSolo';
import PlaybackIndicator from './PlaybackIndicator';
import Timeline from './Timeline';
import UploadZone from './UploadZone';

import { withSeeking } from './withSeeking';

import { InstrumentMap, UnknownInstrument } from '../data/instruments';

import { useNative } from '../hooks/useNative';
import { useSession } from '../hooks/useSession';

const EditorTracksContainer = styled('div')(({ theme }) => ({
  flexGrow: 1,
  margin: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  userSelect: 'none',
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

const WaveformView = withSeeking(styled('img')(() => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  userSelect: 'none',
})));

const WaveformLoader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  height: '100%',
  background: `repeating-linear-gradient(45deg, #0006 0px, #0006 16px, #0004 16px, #0004 32px)`,
  backgroundSize: 'calc(100% + 453px) 100%',
  animation: 'stripesAnimation 7s linear infinite, breathingAnimation 2s ease-in-out infinite',
  '& > div': {
    background: 'rgba(0, 0, 0, 0.5)',
    padding: `${theme.spacing(1)} ${theme.spacing(4)}`,
    borderRadius: 32,
    fontWeight: 700,
    letterSpacing: 1,
  },
  pointerEvents: 'none',
}));

interface EditorTrackProps {
  stemId: number;
  stemOrdinal: number;
  instrument: string;
  name: string;
}

function EditorTrack(props: EditorTrackProps) {
  const [ native, ] = useNative();
  const waveformOrdinal = native!.getWaveformOrdinal(props.stemId);

  const waveformDataUri = useMemo(() => {
    waveformOrdinal;
    return native!.getWaveformDataUri(props.stemId)
  }, [native, waveformOrdinal, props.stemId]);

  const waveformView = useMemo(() => {
    if (waveformDataUri.length > 0) return <WaveformView draggable={false} src={waveformDataUri} />;
    else return <WaveformLoader><div>Przetwarzanie...</div></WaveformLoader>;
  }, [waveformDataUri]);

  const handleMute = useCallback(() => {
    native!.toggleMute(props.stemId);
  }, [native, props.stemId]);

  const handleSolo = useCallback(() => {
    native!.toggleSolo(props.stemId);
  }, [native, props.stemId]);

  return (
    <TrackContainer>
      <TrackTile instrument={props.instrument} icon title={props.name}>
        <TrackLabel>{props.name}</TrackLabel>
      </TrackTile>
      <span style={{ width: 8 }} />
      <MuteSolo 
        mute={native!.isStemMuted(props.stemId)} 
        solo={native!.isStemSoloed(props.stemId)}
        onMute={handleMute}
        onSolo={handleSolo}
        />
      <span style={{ width: 8 }}/>
      <WaveformTile instrument={props.instrument}>
        { waveformView }
      </WaveformTile>
    </TrackContainer>
  );
}

export interface StemData {
  id: number;
  name: string;
  instrument: string;
  path: string;
  losslessPath: string;
  samples: number;
  gainDecibels: number;
  offset: number;
  pan: number;
}

function stemDataToStemInfo(pathPrefix: string, data: StemData): StemInfo {
  return {
    id: data.id,
    gainDb: data.gainDecibels,
    offset: data.offset,
    pan: data.pan,
    path: pathPrefix + '/' + data.path,
    samples: data.samples,
  };
}

interface EditorTracksProps {
  form: FormType;
  data: StemData[];
}

function EditorTracks(props: EditorTracksProps) {
  const { data } = props;
  const [ native, ] = useNative();
  const { stemLocationPrefix } = useSession();

  const sortedStems = useMemo(() => {
    const sortFunc = (a: StemData, b: StemData) => {
      const keyA = (InstrumentMap[a.instrument] || UnknownInstrument).orderingKey;
      const keyB = (InstrumentMap[b.instrument] || UnknownInstrument).orderingKey;
      return keyA - keyB;
    }
    return data.sort(sortFunc);
  }, [data]);

  useEffect(() => {
    const vector = new window.Module.VectorStemInfo();

    data.forEach((item) => vector.push_back(stemDataToStemInfo(stemLocationPrefix!, item)));

    native!.updateStemInfo(vector);
    vector.delete();
  }, [data, native, stemLocationPrefix]);

  return (
    <EditorTracksContainer>
      <Timeline form={props.form}/>
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
        <UploadZone />
      </EditorTracksScrollable>
      <PlaybackIndicator />
    </EditorTracksContainer>
  )
}

export default EditorTracks;
