import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { styled } from '@mui/system';
import logo from '../assets/logo.svg';

import LoadingBar from '../components/LoadingBar';
import { useSession } from "../hooks/useSession";


const Frame = styled('div')(({ theme }) => `
  box-sizing: border-box;
  margin: auto;
  width: 500px;
  max-width: 95vw;
  padding: ${theme.spacing(4)};
  border-radius: ${theme.spacing(2)};
  display: flex;
  flex-direction: column;
  align-items: center;
`);

function MainRoute() {
  const session = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (session.isLoggedIn()) {
      navigate('/songs', { replace: true });
    }
  }, [session, navigate]);

  return (
    <Frame>
      <img src={logo} style={{width: '100%'}}/>
      <LoadingBar />
    </Frame>
  );
}

export default MainRoute;
