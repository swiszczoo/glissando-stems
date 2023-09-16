import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { styled } from '@mui/system';
import logo from '../assets/logo.svg';

import Button from '../components/Button';
import Input from '../components/Input';

import { useAxios } from '../hooks/useAxios';
import { useSession } from '../hooks/useSession';

const Frame = styled('div')(({ theme }) => `
  margin: auto;
  width: 500px;
  max-width: 90vw;
  padding: ${theme.spacing(4)};
  border-radius: ${theme.spacing(2)};
  display: flex;
  flex-direction: column;
  align-items: center;
`);

const PageTitle = styled('h1')(({ theme }) => ({
  fontSize: 32,
  color: theme.palette.secondary.dark,
  textAlign: 'center',
}));

const LoginError = styled('p')(() => ({
  color: '#f09585',
  letterSpacing: 0.4,
}));

const getNextRoute = (session: { routeAfterLogin?: string | undefined }) => {
  return (
    session.routeAfterLogin?.length === 0 
    ? '/' 
    : (session.routeAfterLogin || '/')
  );
};

function LoginRoute() {
  const session = useSession();
  const axios = useAxios();
  const navigate = useNavigate();

  const [ login, setLogin ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ loginPending, setLoginPending ] = useState(false);
  const [ loginError, setLoginError ] = useState('');

  useEffect(() => {
    if (session.isLoggedIn()) {
      navigate(getNextRoute(session), {
        replace: true
      });
    }
  }, [session, navigate]);

  const handleLoginChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setLogin(event.target.value.substring(0, 64));
  }, [setLogin]);

  const handlePasswordChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value.substring(0, 64));
    setLoginError('');
  }, [setPassword]);

  const handleLogin = () => {
    if (login.length === 0 || password.length === 0) return;
    setLoginPending(true);
    setLoginError('');

    axios.post('/api/user/login', { login, password }).then((res) => {
      setLoginPending(false);

      if (res.data['success']) {
        session.invalidateSession();
        navigate(getNextRoute(session), {
          replace: true
        });
      } else {
        setLoginError('Nieznany błąd serwera');
      }
    }).catch((error) => {
      setLoginPending(false);

      if (error.response) {
        if (error.response.status === 401) {
          setLoginError('Nieprawidłowa nazwa użytkownika lub hasło');
          setPassword('');
        } else {
          setLoginError('Nieznany błąd serwera');
        }
      } else {
        setLoginError('Błąd połączenia z serwerem');
      }
    });
  }

  const loginEnabled = !loginPending && login.length > 0 && password.length > 0;

  const handleEnterPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && loginEnabled) {
      handleLogin();
    }
  };

  return (
    <Frame>
      <img src={logo} style={{width: '100%'}}/>
      <br/>
      <PageTitle>Logowanie</PageTitle>
      <Input 
        name='login'
        style={{width: '100%'}} 
        placeholder='Login lub e-mail' 
        value={login} 
        onChange={handleLoginChange} 
        onKeyDown={handleEnterPress}/>
      <Input 
        name='password'
        style={{width: '100%'}} 
        type='password' 
        placeholder='Hasło' 
        value={password} 
        onChange={handlePasswordChange} 
        onKeyDown={handleEnterPress} />
      <LoginError>{ loginError }</LoginError>
      <br/>
      <Button type='button' style={{width: '100%'}} onClick={handleLogin} disabled={!loginEnabled}>
        { loginPending ? '\u2022 \u2022 \u2022' : 'Zaloguj się' }
      </Button>
    </Frame>
  );
}

export default LoginRoute;
