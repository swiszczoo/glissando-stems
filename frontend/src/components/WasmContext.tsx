import { createContext, useMemo, useRef, useState } from 'react';

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
      const moduleScript = document.createElement('script');
      moduleScript.type = 'text/javascript';
      moduleScript.src = '/native/build/glissando-editor.js';
      window._wasmInitialized = () => {
        setInstance(Module);
        window._wasmInitialized = undefined;
      };
      
      document.body.appendChild(moduleScript);
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
