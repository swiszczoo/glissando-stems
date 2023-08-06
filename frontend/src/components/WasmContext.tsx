import { createContext, useMemo, useRef, useState } from 'react';
import Module from '../../native/build/glissando-editor';

export const WasmContext = createContext<WasmContextType>({
  module: undefined,
  ensureModuleIsLoaded: () => false,
});

interface WasmContextType {
  module: EmscriptenModule | undefined,
  ensureModuleIsLoaded: () => boolean,
}

function WasmContextProvider(props: React.PropsWithChildren<object>) {
  const [ instance, setInstance ] = useState<EmscriptenModule | undefined>(undefined);
  const moduleIsLoading = useRef<boolean>(false);

  const contextValue: WasmContextType = useMemo(() => {
    const loadModule = () => {
      moduleIsLoading.current = true;
      Module().then((module: EmscriptenModule) => setInstance(module));
    };

    return {
      module: instance,
      ensureModuleIsLoaded: () => {
        if (instance !== undefined) return true;

        if (!moduleIsLoading.current) {
          loadModule();
        }
        return false;
      },
    };
  }, [instance]);

  return (
    <WasmContext.Provider value={contextValue}>
      {props.children}
    </WasmContext.Provider>
  )
}

export default WasmContextProvider;
