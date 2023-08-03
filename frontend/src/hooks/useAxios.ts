import { useContext } from "react";
import { AxiosContext } from "../components/AxiosContext";

import { AxiosInstance } from "axios";

export function useAxios(): AxiosInstance {
  return useContext(AxiosContext);
}
