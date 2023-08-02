import { styled } from '@mui/system';
import logo from '../assets/logo.svg';

import useSession from "../hooks/useSession";


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

const LoadingBar = styled('div')(({ theme }) => `
    margin-top: ${theme.spacing(4)};
    height: ${theme.spacing(1)};
    border-radius: ${theme.spacing(1)};
    width: 100%;
    background-color: ${theme.palette.background.light};
    background: repeating-linear-gradient(45deg, ${theme.palette.primary.main} 0px, ${theme.palette.primary.main} ${theme.spacing(2)}, ${theme.palette.background.light} ${theme.spacing(2)}, ${theme.palette.background.light} ${theme.spacing(4)});
    animation: stripesAnimation 10s linear infinite;
`);

function MainRoute() {
  useSession();

  return (
    <Frame>
      <img src={logo} style={{width: '100%'}}/>
      <LoadingBar />
    </Frame>
  );
}

export default MainRoute;
