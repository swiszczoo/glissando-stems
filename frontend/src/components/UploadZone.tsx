import { useCallback, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { styled } from '@mui/system';

import Input from './Input';
import Modal from './Modal';
import { GreenButton, NormalButton, RedButton } from './NavbarButton';
import { GlissandoOption, GlissandoSelect } from './Select';
import Slider from './Slider';

import { InstrumentMap } from '../data/instruments';

import { useNative } from '../hooks/useNative';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';

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
  file?: File;
}

const numberRegex = /^-?[0-9]{0,6}$/;

function UploadModal(props: UploadModalProps) {
  const [ native, ] = useNative()
  const [ name, setName ] = useState('');
  const [ instrument, setInstrument ] = useState('other');
  const [ offset, setOffset ] = useState<number | string>(0);
  const [ gain, setGain ] = useState(0);
  const [ pan, setPan ] = useState(0);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.currentTarget.value);
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

  const offsetInMillis = typeof offset === 'number' ? (offset / native!.getSampleRate() * 1000) : 0;

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
        <RedButton><CloseRoundedIcon />&nbsp;Anuluj</RedButton>&nbsp;&nbsp;
        <GreenButton><UploadFileRoundedIcon />&nbsp;Wyślij</GreenButton>
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
    </Modal>
  );
}

function UploadZone() {
  const [ processedFile, setProcessedFile ] = useState<File | undefined>(undefined);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setProcessedFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } = useDropzone({
    onDrop, 
    accept: uploadAccept,
    maxFiles: 1,
  });
  const className = (() => {
    if (isDragAccept) return 'accept';
    if (isDragReject) return 'reject';
    if (isFocused) return 'focused';
    return '';
  })();

  return (
    <>
      <UploadZoneContainer className={className} {...getRootProps()}>
        <input {...getInputProps()} />
        Upuść tutaj plik, aby utworzyć nową ścieżkę...
      </UploadZoneContainer>
      <UploadModal file={processedFile}/>
    </>
  );
}

export default UploadZone;