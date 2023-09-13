import { useState } from 'react';
import { useParams } from 'react-router';
import { ClickAwayListener, Popper } from '@mui/base';
import { styled } from '@mui/system';
import { useQueryClient } from '@tanstack/react-query';

import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';

import { StemData } from './EditorTracks';
import { GreenButton, RedButton } from './NavbarButton';
import Modal from './Modal';
import StemAddEditModal from './StemAddEditModal';

import { useAxios } from '../hooks/useAxios';
import { useSession } from '../hooks/useSession';
import { AxiosError } from 'axios';


const MenuFrame = styled('ul')(({ theme }) => ({
  padding: 0,
  background: theme.palette.background.main,
  boxShadow: `0 0 10px black`,
  margin: 0,
  minWidth: 200,
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
}));

const MenuItem = styled('li')(({ theme }) => ({
  listStyle: 'none',
  display: 'flex',
  padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
  flexDirection: 'row',
  flexWrap: 'nowrap',
  alignItems: 'center',
  justifyContent: 'flex-start',
  userSelect: 'none',
  cursor: 'pointer',
  '&:not(:last-of-type)': {
    borderBottom: `1px solid ${theme.palette.background.light}`,
  },
  '&:hover': {
    background: theme.palette.background.light,
  },
  '& > a': {
    margin: `-${theme.spacing(1)} -${theme.spacing(2)}`,
    padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    color: 'currentColor',
    textDecoration: 'none',
  },
}));

interface DeleteStemModalProps {
  open?: boolean;
  onCancel?: () => void;
  slug: string;
  stemId: number;
  stemName: string;
}

function DeleteStemModal(props: DeleteStemModalProps) {
  const [ processing, setProcessing ] = useState(false);
  const axios = useAxios();
  const session = useSession();
  const queryClient = useQueryClient();

  const handleDelete = () => {
    setProcessing(true);

    axios.delete(`/api/songs/by-slug/${props.slug}/stems/${props.stemId}`).then(() => {
      queryClient.invalidateQueries(['songs']);
      queryClient.invalidateQueries(['stems', props.slug]);
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
        alert('Nie można usunąć ścieżki! Wystąpił nieznany błąd.');
      }
    });
  };

  return (
    <Modal open={props.open} onBlur={props.onCancel} title='Potwierdź usunięcie ścieżki' buttons={() =>
      <>
        <RedButton onClick={props.onCancel}><CloseRoundedIcon />&nbsp;Nie</RedButton>&nbsp;&nbsp;
        <GreenButton onClick={handleDelete}>
          <CheckRoundedIcon /> { processing ? '\u2022 \u2022 \u2022' : <>&nbsp;Tak</> }
        </GreenButton>
      </>
    }>
      <p>Czy na pewno chcesz usunąć ścieżkę o nazwie <strong>"{ props.stemName }"</strong>? Tej operacji nie można cofnąć!</p>
    </Modal>
  );
}

interface StemMenuProps {
  open?: boolean;
  onBlur?: () => void;
  anchorEl: HTMLElement | null;
  stemData: StemData;
  downloadFilename: string;
}

function StemMenu(props: StemMenuProps) {
  const { slug } = useParams();
  const [ deleteModalOpen, setDeleteModalOpen ] = useState(false);
  const [ editModalOpen, setEditModalOpen ] = useState(false);
  const [ modalKey, setModalKey ] = useState(0);
  const queryClient = useQueryClient();
  const session = useSession();

  const handleEditClick = () => {
    setEditModalOpen(true);
    setModalKey(key => key + 1);
    if (props.onBlur) {
      props.onBlur();
    }
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
    setModalKey(key => key + 1);
    if (props.onBlur) {
      props.onBlur();
    }
  }
  
  const handleClickAway = () => {
    if (props.onBlur) {
      props.onBlur();
    }
  };

  const handleModalClose = () => {
    setEditModalOpen(false);
    setDeleteModalOpen(false);
  }

  const handleInvalidate = () => {
    queryClient.invalidateQueries(['songs']);
    queryClient.invalidateQueries(['stems', slug]);
  };

  return (
    <>
      <Popper style={{ zIndex: 9999}} open={!!props.open} anchorEl={props.anchorEl} placement='right'>
        <ClickAwayListener onClickAway={handleClickAway}>
          <MenuFrame role='menu'>
            <MenuItem onClick={handleEditClick}><SettingsRoundedIcon />&nbsp;Edytuj ścieżkę</MenuItem>
            <MenuItem>
              <a onClick={props.onBlur} href={`${session.stemLocationPrefix}/${props.stemData.losslessPath}`} download={props.downloadFilename}>
                <DownloadRoundedIcon />&nbsp;Pobierz
              </a>
            </MenuItem>
            <MenuItem onClick={handleDeleteClick}><DeleteRoundedIcon />&nbsp;Usuń</MenuItem>
          </MenuFrame>
        </ClickAwayListener>
      </Popper>
      {
        deleteModalOpen &&
        <DeleteStemModal
          open
          key={modalKey}
          slug={slug!}
          stemId={props.stemData.id}
          stemName={props.stemData.name}
          onCancel={handleModalClose}
          />
      }
      {
        editModalOpen &&
        <StemAddEditModal 
          key={modalKey} 
          slug={slug!} 
          editData={props.stemData} 
          onClose={handleModalClose} 
          onInvalidate={handleInvalidate}/>
      }
    </>
  );
}

export default StemMenu;
