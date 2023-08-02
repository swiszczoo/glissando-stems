import { useCallback, useContext, useEffect } from "react";
import { SessionContext, SessionContextType } from "../components/SessionContext";

import axios, { AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

const axiosInstance = new axios.Axios({ withCredentials: true });
const sessionCookieName = 'connect.sid';
const sessionDataUrl = '/api/user/me';

function initSessionFromCookie(setContext: React.Dispatch<React.SetStateAction<SessionContextType>>): SessionContextType {
  const sessionId = Cookies.get(sessionCookieName);
  const emptySession = {
    sessionId: '',
    bandName: '',
    login: '',
    email: '',
    firstName: '',
    routeAfterLogin: '',
    pending: false,
  };

  if (!sessionId) {
    return emptySession;
  } else {
    axiosInstance.get(sessionDataUrl).then((res: AxiosResponse) => {
      setContext({
        sessionId,
        bandName: res.data['bandName'],
        email: res.data['email'],
        firstName: res.data['firstName'],
        login: res.data['username'],
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

function useSession() {
  const [ context, setContext ] = useContext(SessionContext);
  let currentContext = context;

  const invalidateSession = useCallback(() => {
    setContext(() => initSessionFromCookie(setContext));
  }, [setContext]);

  if (currentContext === undefined) {
    currentContext = initSessionFromCookie(setContext);
  }

  useEffect(() => {
    if (context === undefined) {
      setContext(() => currentContext);
    }
  }, [context, currentContext, setContext]);

  return {
    ...currentContext,
    invalidateSession
  };
}

export default useSession;