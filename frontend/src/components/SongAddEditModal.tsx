import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { styled } from '@mui/system';

import Input from './Input';
import Modal from './Modal';
import { GreenButton, RedButton } from './NavbarButton';
import Slider from './Slider';
import SliderBox from './SliderBox';
import SongForm from './SongForm';
import { GlissandoTab, GlissandoTabPanel, GlissandoTabs, GlissandoTabsList } from './Tabs';

import { useAxios } from '../hooks/useAxios';
import { useSession } from '../hooks/useSession';
import { SongData } from '../routes/Editor';


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
    '&:disabled': {
      opacity: 0.5,
    },
  }
}));


interface SongAddEditModalProps {
  open?: boolean;
  songData?: SongData;
  onCancel?: () => void;
}

function SongAddEditModal(props: SongAddEditModalProps) {
  const [ title, setTitle ] = useState(props.songData?.title || '');
  const [ tempo, setTempo ] = useState((props.songData?.bpm || 120).toFixed(3).padStart(7, '0'));
  const [ signature, setSignature ] = useState(props.songData?.timeSignature || 4);
  const [ form, setForm ] = useState(props.songData?.form || []);
  const [ processing, setProcessing ] = useState(false);
  const axios = useAxios();
  const session = useSession();
  const queryClient = useQueryClient();

  const isEdit = !!props.songData;
  const signatureAndTempoDisabled = props.songData?.bpm === null && props.songData.timeSignature === null;

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

  const handleAcceptNew = () => {
    if (!valid) return;
    setProcessing(true);

    axios.post('/api/songs', {
      title: title,
      bpm: parseFloat(tempo),
      timeSignature: signature,
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

  const handleAcceptEdit = () => {
    if (!valid) return;
    setProcessing(true);

    const signatureAndTempoData = signatureAndTempoDisabled ? {} : {
      bpm: parseFloat(tempo),
      timeSignature: signature,
    };

    axios.patch(`/api/songs/by-slug/${props.songData!.slug}`, {
      title: title,
      form: form,
      ...signatureAndTempoData
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

  const handleSignatureChange = (_: unknown, value: number | number[]) => {
    setSignature(value as number);
  };

  const mainPage = (
    <>
      Tytuł utworu:
      <Input value={title} placeholder='Wprowadź tytuł utworu' onChange={handleTitleChange}/>
      Metrum:
      <SliderBox>
        <Slider min={1} max={9} value={signature} onChange={handleSignatureChange} disabled={signatureAndTempoDisabled}/>
        <div>{signature} / 4</div>
      </SliderBox>
      Tempo:
      <TempoFrame>
        <Input onKeyDown={handleTempoKeyDown.bind(null, 0)} value={tempo[0]} disabled={signatureAndTempoDisabled}/>
        <Input data-focusafter='bpm0' onKeyDown={handleTempoKeyDown.bind(null, 1)} value={tempo[1]} disabled={signatureAndTempoDisabled} />
        <Input data-focusafter='bpm1' onKeyDown={handleTempoKeyDown.bind(null, 2)} value={tempo[2]} disabled={signatureAndTempoDisabled} />
        <span style={{ fontWeight: 700 }}>.</span>
        <Input data-focusafter='bpm2' onKeyDown={handleTempoKeyDown.bind(null, 4)} value={tempo[4]} disabled={signatureAndTempoDisabled} />
        <Input data-focusafter='bpm4' onKeyDown={handleTempoKeyDown.bind(null, 5)} value={tempo[5]} disabled={signatureAndTempoDisabled} />
        <Input data-focusafter='bpm5' onKeyDown={handleTempoKeyDown.bind(null, 6)} value={tempo[6]} disabled={signatureAndTempoDisabled} />
        <span style={{ fontWeight: 700 }}>&nbsp;BPM</span>
      </TempoFrame>
      { signatureAndTempoDisabled && <><br /><strong>Dla tego utworu zablokowano zmianę metrum i tempa!</strong></> }
    </>
  );

  return (
    <Modal open={props.open} onBlur={props.onCancel} title={isEdit ? 'Właściwości utworu' : 'Dodaj nowy utwór'} buttons={() =>
      <>
        <RedButton onClick={props.onCancel}><CloseRoundedIcon />&nbsp;Anuluj</RedButton>&nbsp;&nbsp;
        <GreenButton onClick={isEdit ? handleAcceptEdit : handleAcceptNew} disabled={!valid}>
          <CheckRoundedIcon />{ processing ? '\u2022 \u2022 \u2022' : <>&nbsp;Zaakceptuj</> }
        </GreenButton>
      </>
    }>
      { !isEdit && mainPage }
      { 
        isEdit && 
        <GlissandoTabs defaultValue={1}>
          <GlissandoTabsList>
            <GlissandoTab value={1}>Metadane</GlissandoTab>
            <GlissandoTab value={2}>Forma</GlissandoTab>
          </GlissandoTabsList>
          <GlissandoTabPanel value={1}>{mainPage}</GlissandoTabPanel>
          <GlissandoTabPanel value={2}>
            <SongForm form={form} onUpdate={setForm}/>
          </GlissandoTabPanel>
        </GlissandoTabs>
      }
    </Modal>
  );
}

export default SongAddEditModal;
