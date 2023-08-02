import { styled } from '@mui/system';
import logo from '../assets/logo.svg';

import Button from '../components/Button';
import Input from '../components/Input';
import useSession from '../hooks/useSession';

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

function LoginRoute() {
    const session = useSession();

    return (
        <Frame>
            <img src={logo} style={{width: '100%'}}/>
            <br/>
            <PageTitle>Logowanie</PageTitle>
            <Input style={{width: '100%'}} placeholder='Login lub e-mail'/>
            <br/>
            <Input style={{width: '100%'}} type='password' placeholder='Hasło'/>
            <br/><br/>
            <Button style={{width: '100%'}}>Zaloguj się</Button>
        </Frame>
    );
}

export default LoginRoute;
