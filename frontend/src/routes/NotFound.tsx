import { styled } from '@mui/system';
import LinkButton from '../components/LinkButton';

const Frame = styled('div')(({ theme }) => `
    margin: auto;
    min-width: 500px;
    background-color: ${theme.palette.background.light};
    padding: ${theme.spacing(4)};
    border-radius: ${theme.spacing(2)};
    display: flex;
    flex-direction: column;
    align-items: center;
`);

const ErrorCode = styled('h1')(({ theme }) => `
    margin: 0;
    font-size: 72pt;
    color: ${theme.palette.secondary.main};
    text-align: center;
`);

const ErrorText = styled('p')(() => `
    font-size: 18pt;
    text-align: center;
`);

function NotFoundRoute() {
    return (
        <Frame>
            <ErrorCode>404!</ErrorCode>
            <ErrorText>Szukana strona nie została znaleziona.</ErrorText>
            <br/>
            <LinkButton style={{ minWidth: 200 }} to='/'>Wróć</LinkButton>
        </Frame>
    );
}

export default NotFoundRoute;
