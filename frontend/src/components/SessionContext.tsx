import { createContext, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { AxiosInstance, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

import { useAxios } from '../hooks/useAxios';

interface SessionContextData {
  sessionId: string;
  firstName: string;
  login: string;
  email: string;
  bandName: string;
  routeAfterLogin: string;
  stemLocationPrefix: string;
  pending: boolean;
}
export type SessionContextType = SessionContextData | undefined;
type ContextType = [SessionContextType, React.Dispatch<React.SetStateAction<SessionContextType>>];

export const SessionContext = createContext<ContextType>([undefined, () => undefined]);

const sessionCookieName = 'connect.sid';
const sessionDataUrl = '/api/user/me';

function initSessionFromCookie(
  axios: AxiosInstance, 
  setContext: React.Dispatch<React.SetStateAction<SessionContextType>>
): SessionContextType {
  const sessionId = Cookies.get(sessionCookieName);
  const emptySession = {
    sessionId: '',
    bandName: '',
    login: '',
    email: '',
    firstName: '',
    routeAfterLogin: '',
    stemLocationPrefix: '',
    pending: false,
  };

  if (!sessionId) {
    return emptySession;
  } else {
    axios.get(sessionDataUrl).then((res: AxiosResponse) => {
      setContext({
        sessionId,
        bandName: res.data['bandName'],
        email: res.data['email'],
        firstName: res.data['firstName'],
        login: res.data['username'],
        stemLocationPrefix: res.data['stemLocationPrefix'],
        pending: false,
        routeAfterLogin: '',
      });
    }).catch(() => setContext(emptySession));

    return {
      ...emptySession,
      sessionId,
    };
  }
}

function SessionContextLoginTeleport() {
  const [ context, setContext ] = useContext(SessionContext);
  const location = useLocation();
  const navigate = useNavigate();
  const axios = useAxios();

  useEffect(() => {
    if (!context) {
      setContext(initSessionFromCookie(axios, setContext));
      return;
    }

    if (context!.sessionId === '' && !context!.pending && !location.pathname.startsWith('/login')) {
      setContext({ ...context, routeAfterLogin: location.pathname });
      navigate('/login', {
        replace: true
      });
    }
  }, [axios, context, location, navigate, setContext]);

  return <></>;
}

function SessionContextProvider(props: React.PropsWithChildren<object>) {
  const state = useState<SessionContextType>(undefined);

  return (
    <SessionContext.Provider value={state}>
      <SessionContextLoginTeleport/>
      { state[0] !== undefined && !state[0].pending && props.children}
    </SessionContext.Provider>
  );
}
export default SessionContextProvider;
