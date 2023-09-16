import { useState } from 'react';
import { styled } from '@mui/system';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { useAxios } from '../hooks/useAxios';

import Input from './Input';
import Modal from './Modal';
import { RedButton, YellowButton } from './NavbarButton';

interface ChangePasswordModalProps {
  open?: boolean;
  onBlur?: () => void;
}

const LoginError = styled('p')(() => ({
  color: '#f09585',
  letterSpacing: 0.4,
}));

function ChangePasswordModal(props: ChangePasswordModalProps) {
  const axios = useAxios();

  const [ currentPassword, setCurrentPassword ] = useState('');
  const [ newPassword, setNewPassword ] = useState('');
  const [ repeatPassword, setRepeatPassword ] = useState('');
  const [ processing, setProcessing ] = useState(false);
  const [ error, setError ] = useState('');

  const handleCurrentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPassword(event.currentTarget.value);
  }

  const handleNewChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(event.currentTarget.value);
  };

  const handleRepeatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRepeatPassword(event.currentTarget.value);
  }

  const valid = (!processing && currentPassword.length > 0 
    && newPassword.length > 0 && newPassword === repeatPassword);

  const handleChangeClick = () => {
    if (!valid) return;

    setProcessing(true);
    setError('');

    axios.put('/api/user/me/password', { currentPassword, newPassword }).then(() => {
      setProcessing(false);
      if (props.onBlur) props.onBlur();
    }).catch((error) => {
      setProcessing(false);

      if (error.response) {
        if (error.response.status === 401) {
          setError('Nieprawidłowe obecne hasło!');
          setCurrentPassword('');
        } else {
          setError('Nieznany błąd serwera!');
        }
      } else {
        setError('Błąd połączenia z serwerem!');
      }
  });
  };

  return (
    <Modal open={props.open} title='Zmiana hasła' onBlur={props.onBlur} buttons={() =>
      <>
        <RedButton onClick={props.onBlur}><CloseRoundedIcon />&nbsp;Anuluj</RedButton>&nbsp;&nbsp;
        <YellowButton disabled={!valid} onClick={handleChangeClick}>
          <LockOutlinedIcon />{ processing ? '\u2022 \u2022 \u2022' : <>&nbsp;Zmień hasło</> }
        </YellowButton>
      </>
    }>
      Obecne hasło:
      <Input name='password' type='password' placeholder='Wprowadź obecne hasło' value={currentPassword} onChange={handleCurrentChange} />
      Nowe hasło:
      <Input name='new-password' type='password' placeholder='Wprowadź nowe hasło' value={newPassword} onChange={handleNewChange} />
      Powtórz nowe hasło:
      <Input name='repeat-password' type='password' placeholder='Wprowadź ponownie nowe hasło' value={repeatPassword} onChange={handleRepeatChange} />
      {
        newPassword.length > 0 && repeatPassword.length > 0 && newPassword !== repeatPassword &&
        <LoginError><br/>Nowe hasła różnią się od siebie!</LoginError>
      }
      {
        error &&
        <LoginError><br/>{error}</LoginError>
      }
    </Modal>
  );
}

export default ChangePasswordModal;
