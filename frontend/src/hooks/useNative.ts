import { useContext } from "react";
import { WasmContext } from "../components/WasmContext";

function useNative(): EmscriptenModule | undefined {
  const ctx = useContext(WasmContext);
  ctx.ensureModuleIsLoaded();
  
  return ctx.module;
}

export default useNative;
