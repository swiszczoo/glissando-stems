import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useParams } from 'react-router';
import { styled } from '@mui/system';
import { useQueryClient } from '@tanstack/react-query';

import StemAddEditModal from './StemAddEditModal';


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
    queryClient.invalidateQueries(['songs']);
    queryClient.invalidateQueries(['songs', slug]);
    queryClient.invalidateQueries(['stems', slug]);
  };

  return (
    <>
      <UploadZoneContainer className={className} {...getRootProps()}>
        <input {...getInputProps()} />
        Upuść tutaj plik, aby utworzyć nową ścieżkę...
      </UploadZoneContainer>
      <StemAddEditModal key={modalKey} slug={slug!} file={processedFile} onClose={handleClose} onInvalidate={handleInvalidate}/>
    </>
  );
}

export default UploadZone;
