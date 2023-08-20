import { createContext, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import axios, { AxiosInstance } from "axios";

export const AxiosContext = createContext<AxiosInstance>(axios.create());

function AxiosContextProvider(props: React.PropsWithChildren<object>) {
  const axiosInstance = useMemo(() => axios.create({ withCredentials: true }), []);
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnMount: true,
      },
    },
  }), []);
  return (
    <AxiosContext.Provider value={axiosInstance}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </AxiosContext.Provider>
  );
}
export default AxiosContextProvider;
