import { useContext, useMemo } from "react";
import { WasmContext } from "../components/WasmContext";

export function useNative(): [NativeMixer | undefined, () => void] {
  const ctx = useContext(WasmContext);
  ctx.ensureModuleIsLoaded();

  const module = ctx.module;
  const mixer = useMemo(() => module?.getGlobalMixer(), [module]);
  
  return useMemo(() => [mixer, ctx.invalidateState], [mixer, ctx]);
}

export function useNativeLazy(): [NativeMixer | undefined, () => void] {
  const ctx = useContext(WasmContext);

  const module = ctx.module;
  const mixer = useMemo(() => module?.getGlobalMixer(), [module]);
  
  return useMemo(() => [mixer, ctx.invalidateState], [mixer, ctx]);
}
