import { useCallback, useContext, useEffect } from "react";
import { SessionContext, SessionContextType } from "../components/SessionContext";
import { useAxios } from "./useAxios";

import { AxiosInstance, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';


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

export function useSession() {
  const [ context, setContext ] = useContext(SessionContext);
  const axios = useAxios();
  let currentContext = context;

  const invalidateSession = useCallback(() => {
    setContext(() => initSessionFromCookie(axios, setContext));
  }, [axios, setContext]);

  const isLoggedIn = useCallback(() => {
    if (!context) return false;
    
    return !context.pending && context.login.length > 0;
  }, [context]);

  if (currentContext === undefined) {
    currentContext = initSessionFromCookie(axios, setContext);
  }

  useEffect(() => {
    if (context === undefined) {
      setContext(() => currentContext);
    }
  }, [context, currentContext, setContext]);

  return {
    ...currentContext,
    invalidateSession,
    isLoggedIn,
  };
}
