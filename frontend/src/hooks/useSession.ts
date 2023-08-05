import { useCallback, useContext } from "react";
import { SessionContext } from "../components/SessionContext";


export function useSession() {
  const [ context, setContext ] = useContext(SessionContext);

  const invalidateSession = useCallback(() => {
    setContext(undefined);
  }, [setContext]);

  const isLoggedIn = useCallback(() => {
    if (!context) return false;
    
    return !context.pending && context.login.length > 0;
  }, [context]);

  return {
    ...context,
    invalidateSession,
    isLoggedIn,
  };
}
