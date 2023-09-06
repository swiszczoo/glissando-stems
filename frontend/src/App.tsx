import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
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

import { useNativeLazy } from './hooks/useNative';

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

function AudioContextKiller() {
  const location = useLocation();
  const [ native, ] = useNativeLazy();
  const pathname = location.pathname;

  useEffect(() => {
    const audioContextAllowed = pathname.startsWith('/songs/edit')
      || pathname.startsWith('/songs/play');

    if (!audioContextAllowed) {
      if (window.audioContext) {
        setTimeout(() => window.audioContext?.suspend(), 100);
      }

      if (native && native.getPlaybackState() !== 'stop') {
        native.stop();
      }

      if (native && native.getStemCount() > 0) {
        const emptyVector = new window.Module.VectorStemInfo();
        native.updateStemInfo(emptyVector);
        emptyVector.delete();
      }
    }
  }, [pathname, native]);

  return <></>;
}

function App() {
  return (
    <WasmContextProvider>
      <ThemeProvider theme={theme}>
        <AxiosContextProvider>
          <SessionContextProvider>
              <AudioContextKiller />
              <Routes>
                <Route path='' Component={() => <Page name="Ładowanie"><MainRoute /></Page>} />
                <Route path='login' Component={() => <Page name="Logowanie"><LoginRoute /></Page>} />
                <Route path='songs' Component={() => <Page name="Lista utworów"><SongListRoute /></Page>} />
                <Route path='songs/edit/:slug' Component={EditorRoute} />
                <Route path='*' Component={() => <Page name="Nie znaleziono"><NotFoundRoute /></Page>} />
              </Routes>
          </SessionContextProvider>
        </AxiosContextProvider>
      </ThemeProvider>
    </WasmContextProvider>
  );
}

export default App
