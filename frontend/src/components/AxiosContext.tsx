import { createContext, useMemo } from "react";

import axios, { AxiosInstance } from "axios";

export const AxiosContext = createContext<AxiosInstance>(axios.create());

function AxiosContextProvider(props: React.PropsWithChildren<object>) {
  const axiosInstance = useMemo(() => axios.create({ withCredentials: true }), []);
  return <AxiosContext.Provider value={axiosInstance}>{props.children}</AxiosContext.Provider>
}
export default AxiosContextProvider;
