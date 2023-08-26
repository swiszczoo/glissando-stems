import { useContext, useMemo } from "react";
import { WasmContext } from "../components/WasmContext";

interface GlissandoModule extends EmscriptenModule {
  getGlobalMixer: () => NativeMixer;
}

export function useNative(): [NativeMixer | undefined, () => void] {
  const ctx = useContext(WasmContext);
  ctx.ensureModuleIsLoaded();

  const module = ctx.module as GlissandoModule;
  const mixer = useMemo(() => module?.getGlobalMixer(), [module]);
  
  return useMemo(() => [mixer, ctx.invalidateState], [mixer, ctx]);
}
