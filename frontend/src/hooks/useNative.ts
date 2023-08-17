import { useContext, useMemo } from "react";
import { WasmContext } from "../components/WasmContext";

interface GlissandoModule extends EmscriptenModule {
  getGlobalMixer: () => NativeMixer;
}

function useNative(): [NativeMixer | undefined, () => void] {
  const ctx = useContext(WasmContext);
  ctx.ensureModuleIsLoaded();

  const mixer = useMemo(() => (ctx.module as GlissandoModule)?.getGlobalMixer(), [ctx]);
  
  return [mixer, ctx.invalidateState];
}

export default useNative;
