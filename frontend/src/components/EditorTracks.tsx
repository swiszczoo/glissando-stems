import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { styled } from '@mui/system';

import InstrumentTile from './InstrumentTile';
import MuteSolo from './MuteSolo';
import PlaybackIndicator from './PlaybackIndicator';
import StemMenu from './StemMenu';
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
  cursor: 'pointer',
  transition: '0.2s',
  '&:hover, &.active': {
    borderColor: theme.palette.primary.dark,
  },
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
  background: 'rgba(0, 0, 0, 0.7)',
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
  songName: string;
  stemOrdinal: number;
  stemData: StemData;
  contextMenuOpen?: boolean;
  onClick?: () => void;
  onContextMenuBlur?: () => void;
}

function EditorTrack(props: EditorTrackProps) {
  const [ native, ] = useNative();
  const trackTileRef = useRef<HTMLDivElement>(null);
  const waveformOrdinal = native!.getWaveformOrdinal(props.stemData.id);

  const waveformDataUri = useMemo(() => {
    waveformOrdinal;
    return native!.getWaveformDataUri(props.stemData.id)
  }, [native, waveformOrdinal, props.stemData.id]);

  const waveformView = useMemo(() => {
    if (waveformDataUri.length > 0) return <WaveformView draggable={false} src={waveformDataUri} />;
    else return <WaveformLoader><div>Przetwarzanie...</div></WaveformLoader>;
  }, [waveformDataUri]);

  const handleMute = useCallback(() => {
    native!.toggleMute(props.stemData.id);
  }, [native, props.stemData.id]);

  const handleSolo = useCallback(() => {
    native!.toggleSolo(props.stemData.id);
  }, [native, props.stemData.id]);

  return (
    <TrackContainer>
      <TrackTile 
        className={props.contextMenuOpen ? 'active' : ''}
        onClick={props.onClick} 
        tabIndex={0}
        ref={trackTileRef} 
        instrument={props.stemData.instrument} 
        icon 
        title={props.stemData.name}>

        <TrackLabel>{props.stemData.name}</TrackLabel>
      </TrackTile>
      <span style={{ width: 8 }} />
      <MuteSolo 
        mute={native!.isStemMuted(props.stemData.id)} 
        solo={native!.isStemSoloed(props.stemData.id)}
        onMute={handleMute}
        onSolo={handleSolo}
        />
      <span style={{ width: 8 }}/>
      <WaveformTile instrument={props.stemData.instrument}>
        { waveformView }
      </WaveformTile>
      <StemMenu 
        anchorEl={trackTileRef.current} 
        open={props.contextMenuOpen} 
        onBlur={props.onContextMenuBlur}
        stemData={props.stemData}
        downloadFilename={`${props.stemData.name} - [${props.songName}].flac`}/>
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
  songName: string;
  form: FormType;
  data: StemData[];
}

function EditorTracks(props: EditorTracksProps) {
  const { data } = props;
  const [ native, ] = useNative();
  const { stemLocationPrefix } = useSession();
  const [ contextMenuStemId, setContextMenuStemId ] = useState<number | undefined>(undefined);

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

  const handleTrackClick = (stemId: number) => {
    setContextMenuStemId(stemId);
  };

  const handleTrackCtxMenuBlur = () => {
    setContextMenuStemId(undefined);
  }

  return (
    <EditorTracksContainer>
      <Timeline form={props.form}/>
      <EditorTracksScrollable>
        {
          sortedStems.map((stem: StemData, index: number) => (
            <EditorTrack 
              key={stem.id} 
              stemOrdinal={index}
              songName={props.songName}
              stemData={stem}
              contextMenuOpen={contextMenuStemId === stem.id}
              onClick={handleTrackClick.bind(null, stem.id)}
              onContextMenuBlur={handleTrackCtxMenuBlur} />
          ))
        }
        <UploadZone />
      </EditorTracksScrollable>
      <PlaybackIndicator />
    </EditorTracksContainer>
  )
}

export default EditorTracks;
