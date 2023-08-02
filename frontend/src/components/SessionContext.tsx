import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

interface SessionContextData {
  sessionId: string;
  firstName: string;
  login: string;
  email: string;
  bandName: string;
  routeAfterLogin: string;
  pending: boolean;
}
export type SessionContextType = SessionContextData | undefined;
type ContextType = [SessionContextType, React.Dispatch<React.SetStateAction<SessionContextType>>];

export const SessionContext = createContext<ContextType>([undefined, () => undefined]);

function SessionContextLoginTeleport() {
  const [ context, ] = useContext(SessionContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!context) return;

    if (context!.sessionId === '' && !context!.pending) {
      navigate('/login', {
        replace: true
      });
    }
  }, [context, navigate]);

  return <></>;
}

function SessionContextProvider(props: React.PropsWithChildren<object>) {
  const state = useState<SessionContextType>(undefined);

  return (
    <SessionContext.Provider value={state}>
      <SessionContextLoginTeleport/>
      {props.children}
    </SessionContext.Provider>
  );
}
export default SessionContextProvider;
