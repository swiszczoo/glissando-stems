import { styled } from '@mui/system';

import InstrumentTile from './InstrumentTile';
import MuteSolo from './MuteSolo';

const EditorTracksContainer = styled('div')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
}));

const EditorTracksScrollable = styled('div')(({ theme }) => ({
  overflow: 'hidden scroll',
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

function EditorTracks() {
  return (
    <EditorTracksContainer>
      <EditorTracksScrollable>
        <EditorTrack instrument='keys-lead' name='0' />
        <EditorTrack instrument='keys-lead' name='1' />
        <EditorTrack instrument='keys-lead' name='2' />
        <EditorTrack instrument='keys-lead' name='3' />
        <EditorTrack instrument='keys-lead' name='4' />
        <EditorTrack instrument='keys-lead' name='5' />
        <EditorTrack instrument='keys-lead' name='6' />
        <EditorTrack instrument='keys-lead' name='7' />
        <EditorTrack instrument='keys-lead' name='8' />
        <EditorTrack instrument='keys-lead' name='9' />
      </EditorTracksScrollable>
    </EditorTracksContainer>
  )
}

export default EditorTracks;
