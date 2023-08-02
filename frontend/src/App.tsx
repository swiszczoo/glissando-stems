import { Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/system';

import LoginRoute from './routes/Login';
import NotFoundRoute from './routes/NotFound';

import Page from './components/Page';

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
      contrastText: '#8cb2d9',
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Routes>
        <Route path='login' Component={() => <Page name="Logowanie"><LoginRoute/></Page>} />
        <Route path='*' Component={() => <Page name="Nie znaleziono"><NotFoundRoute/></Page>} />
      </Routes>
    </ThemeProvider>
  );
}

export default App
