import { Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/system';

import EditorRoute from './routes/Editor';
import LoginRoute from './routes/Login';
import MainRoute from './routes/Main';
import NotFoundRoute from './routes/NotFound';
import SongListRoute from './routes/SongList';

import AxiosContextProvider from './components/AxiosContext';
import Page from './components/Page';
import SessionContextProvider from './components/SessionContext';
import WasmContextProvider from './components/WasmContext';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8cb2d9',
      dark: '#46586b',
      light: '#9fc9f5',
      contrastText: '#0e1216'
    },
    secondary: {
      main: '#46586b',
      dark: '#46586b',
      light: '#8cb2d9',
      contrastText: '#0e1216'
    },
    background: {
      main: '#0e1216',
      dark: '#000000',
      light: '#182125',
      hover: '#212d33',
      contrastText: '#8cb2d9',
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AxiosContextProvider>
        <SessionContextProvider>
          <WasmContextProvider>
            <Routes>
              <Route path='' Component={() => <Page name="Ładowanie"><MainRoute /></Page>} />
              <Route path='login' Component={() => <Page name="Logowanie"><LoginRoute /></Page>} />
              <Route path='songs' Component={() => <Page name="Lista utworów"><SongListRoute /></Page>} />
              <Route path='songs/edit/:slug' Component={() => <Page name='Edycja utworu'><EditorRoute /></Page>} />
              <Route path='*' Component={() => <Page name="Nie znaleziono"><NotFoundRoute /></Page>} />
            </Routes>
          </WasmContextProvider>
        </SessionContextProvider>
      </AxiosContextProvider>
    </ThemeProvider>
  );
}

export default App
