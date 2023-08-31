import { useCallback, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useParams } from 'react-router';
import { styled } from '@mui/system';
import { useQueryClient } from '@tanstack/react-query';
import { AxiosProgressEvent } from 'axios';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';

import Input from './Input';
import Modal from './Modal';
import { GreenButton, NormalButton, RedButton } from './NavbarButton';
import ProgressBar from './ProgressBar';
import { GlissandoOption, GlissandoSelect } from './Select';
import Slider from './Slider';

import { InstrumentMap } from '../data/instruments';

import { useAxios } from '../hooks/useAxios';
import { useNative } from '../hooks/useNative';
import LoadingBar from './LoadingBar';


const uploadAccept = {
  'audio/*': []
};

const UploadZoneContainer = styled('div')(({ theme }) => ({
  height: 72,
  border: `2px dashed ${theme.palette.primary.dark}40`,
  background: theme.palette.background.light,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 20,
  letterSpacing: 1,
  color: theme.palette.primary.dark,
  marginLeft: 135,
  marginRight: 2,
  transition: '0.5s',
  '&.accept': {
    borderColor: '#0fad0f',
    color: '#0fad0f',
  },
  '&.reject': {
    borderColor: '#d13b32',
    color: '#d13b32',
  },
}));

const SliderBox = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  alignItems: 'center',
  '& > div': {
    whiteSpace: 'nowrap',
    minWidth: 100,
    textAlign: 'right',
    fontSize: 20,
    fontWeight: 700,
  }
}));

interface UploadModalProps {
  slug: string;
  file?: File;
  onInvalidate?: () => void;
  onClose?: () => void;
}

const numberRegex = /^-?[0-9]{0,6}$/;

function UploadModal(props: UploadModalProps) {
  const axios = useAxios();
  const [ native, ] = useNative()
  const [ name, setName ] = useState('');
  const [ instrument, setInstrument ] = useState('other');
  const [ offset, setOffset ] = useState<number | string>(0);
  const [ gain, setGain ] = useState(0);
  const [ pan, setPan ] = useState(0);
  const [ action, setAction ] = useState('');
  const [ actionState, setActionState ] = useState<'idle' | 'sending' | 'converting'>('idle');
  const [ uploadProgress, setUploadProgress ] = useState(0);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.currentTarget.value.substring(0, 255));
  }

  const handleInstrumentChange = (_: unknown, newValue: unknown) => {
    setInstrument(newValue as string);
  };

  const handleOffsetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.value.length === 0) {
      setOffset('');
      return;
    }

    if (event.currentTarget.value === '-') {
      setOffset('-');
      return;
    }

    if (numberRegex.test(event.currentTarget.value)) {
      setOffset(parseInt(event.currentTarget.value));
    }
  };

  const handleGainChange = (_: unknown, value: number | number[]) => {
    setGain(value as number);
  };

  const handlePanChange = (_: unknown, value: number | number[]) => {
    setPan(value as number);
  };

  const handleUploadClick = () => {
    if (!props.file) return;

    setUploadProgress(0);
    setAction('Wysyłanie pliku...');
    setActionState('sending');

    const formData = new FormData();
    const stemData = {
      name,
      instrument,
      offset,
      gainDecibels: gain,
      pan,
    };

    const uploadProgressHandler = (event: AxiosProgressEvent) => {
      const progress = event.loaded / event.total!
      setUploadProgress(progress);
      setAction(`Wysyłanie pliku (${(progress * 100).toFixed()}%)...`);
    };

    const checkFileState = async (id: number) => {
      axios.get(`/api/songs/by-slug/${props.slug}/stems/${id}`).then((res) => {
        const processing = res.data['processing'];
        const failed = res.data['failed'];
        const path = res.data['path'];

        if (!processing && !failed && path) {
          if (props.onClose) props.onClose();
          if (props.onInvalidate) props.onInvalidate();
        } else if (processing) {
          setTimeout(checkFileState.bind(null, id), 1000);
        } else if (failed) {
          alert('Przetwarzanie pliku nie powiodło się!');
          if (props.onClose) props.onClose();
        }
      }).catch(() => {
        alert('Przetwarzanie pliku nie powiodło się!');
        if (props.onClose) props.onClose();
        if (props.onInvalidate) props.onInvalidate();
      });
    };

    formData.set('data', JSON.stringify(stemData));
    formData.set('stem', props.file);
    axios.post(`/api/songs/by-slug/${props.slug}/stems`, formData, {
      onUploadProgress: uploadProgressHandler,
    }).then((res) => {
      setAction('Konwertowanie...');
      setActionState('converting');

      checkFileState(res.data['id']);
    }).catch(() => {
      alert('Wysyłanie pliku nie powiodło się!');
      setAction('');
      setActionState('idle');
    });
  };

  const offsetInMillis = typeof offset === 'number' ? (offset / native!.getSampleRate() * 1000) : 0;
  const canUpload = name.trim().length > 0 && typeof offset === 'number' && actionState === 'idle';

  const instrumentList = useMemo(() => {
    const instruments: React.JSX.Element[] = [];
    
    for (const key in InstrumentMap) {
      instruments.push(
        <GlissandoOption key={key} value={key}>
          <div>{InstrumentMap[key].iconSrc.length > 0 && <img src={InstrumentMap[key].iconSrc} />}</div>
          {InstrumentMap[key].displayName}
        </GlissandoOption>
      );
    }

    return instruments;
  }, []);

  return (
    <Modal title='Utwórz nową ścieżkę dla pliku' open={!!props.file} buttons={() =>
      <>
        {action}
        <span style={{ flexGrow: 1}} />
        <RedButton disabled={actionState !== 'idle'} onClick={props.onClose}>
          <CloseRoundedIcon />&nbsp;Anuluj
        </RedButton>&nbsp;&nbsp;
        <GreenButton disabled={!canUpload} onClick={handleUploadClick}>
          { actionState !== 'idle' ? '\u2022 \u2022 \u2022' : <><UploadFileRoundedIcon />&nbsp;Wyślij</> }
        </GreenButton>
      </>
    }>
      Nazwa ścieżki:
      <Input placeholder='Wprowadź nazwę' value={name} onChange={handleNameChange}/>
      Instrument (ikona):
      <GlissandoSelect value={instrument} onChange={handleInstrumentChange}>
        { instrumentList }
      </GlissandoSelect>
      Opóźnienie (próbki):
      <SliderBox>
        <Input style={{ width: '100%' }} placeholder='Wprowadź opóźnienie w liczbie próbek' value={offset} onChange={handleOffsetChange}/>
        <div>= {offsetInMillis.toFixed(1)} ms</div>
      </SliderBox>
      Wzmocnienie:
      <SliderBox>
        <Slider min={-24} max={12} value={gain} onChange={handleGainChange}/>
        <div>{gain >= 0 && '+'}{gain} dB</div>
      </SliderBox>
      Panorama:
      <SliderBox>
        <Slider slots={{ track: ()=><></> }} min={-1} max={1} step={0.05} value={pan} onChange={handlePanChange} />
        <div>
          {pan === 0 && 'L = R'}
          {pan < 0 && `L+${(-pan * 100).toFixed()}`}
          {pan > 0 && `R+${(pan * 100).toFixed()}`}
        </div>
      </SliderBox>
      <br />
      {
        props.file &&
        <>
          Wysyłany plik:&nbsp;&nbsp;&nbsp;
          <NormalButton disabled style={{ cursor: 'default' }}>
            <InsertDriveFileOutlinedIcon />&nbsp;
            {props.file.name} ({(props.file.size / 1e6).toFixed(2)} MB)
          </NormalButton>
        </>
      }
      {
        actionState === 'converting' 
        ? <LoadingBar />
        : <ProgressBar value={uploadProgress} enabled={actionState === 'sending'}/>
      }
    </Modal>
  );
}

function UploadZone() {
  const { slug } = useParams();
  const [ processedFile, setProcessedFile ] = useState<File | undefined>(undefined);
  const [ modalKey, setModalKey ] = useState(0);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setProcessedFile(acceptedFiles[0]);
    setModalKey(key => key + 1);
  }, []);

  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } = useDropzone({
    onDrop, 
    accept: uploadAccept,
    maxFiles: 1,
  });

  const queryClient = useQueryClient();
  const className = (() => {
    if (isDragAccept) return 'accept';
    if (isDragReject) return 'reject';
    if (isFocused) return 'focused';
    return '';
  })();

  const handleClose = () => {
    setProcessedFile(undefined);
  };

  const handleInvalidate = () => {
    queryClient.invalidateQueries(['songs', slug]);
    queryClient.invalidateQueries(['stems', slug]);
  };

  return (
    <>
      <UploadZoneContainer className={className} {...getRootProps()}>
        <input {...getInputProps()} />
        Upuść tutaj plik, aby utworzyć nową ścieżkę...
      </UploadZoneContainer>
      <UploadModal key={modalKey} slug={slug!} file={processedFile} onClose={handleClose} onInvalidate={handleInvalidate}/>
    </>
  );
}

export default UploadZone;
