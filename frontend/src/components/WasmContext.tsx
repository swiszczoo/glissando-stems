import { createContext, useMemo, useRef, useState } from 'react';

export const WasmContext = createContext<WasmContextType>({
  module: undefined,
  ensureModuleIsLoaded: () => false,
  invalidateState: () => {},
});

interface WasmContextType {
  module: EmscriptenModule | undefined,
  ensureModuleIsLoaded: () => boolean,
  invalidateState: () => void,
}

function WasmContextProvider(props: React.PropsWithChildren<object>) {
  const [ instance, setInstance ] = useState<EmscriptenModule | undefined>(undefined);
  const [ inv, setInv ] = useState(0);
  const moduleIsLoading = useRef<boolean>(false);

  const contextValue: WasmContextType = useMemo(() => {
    const loadModule = () => {
      window.Module = {} as EmscriptenModule;
      window.Module.locateFile = (url, ) => url;
      
      moduleIsLoading.current = true;
      const moduleScript = document.createElement('script');
      moduleScript.type = 'text/javascript';
      moduleScript.src = '/native/build/glissando-editor.js';
      window._wasmInitialized = () => {
        setInstance(window.Module);
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

      invalidateState: () => {
        setInv(inv + 1);
      },
    };
  }, [instance, inv]);

  return (
    <WasmContext.Provider value={contextValue}>
      {props.children}
    </WasmContext.Provider>
  )
}

export default WasmContextProvider;
