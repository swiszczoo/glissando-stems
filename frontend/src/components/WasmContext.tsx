import { 
  createContext, 
  useCallback, 
  useEffect, 
  useMemo, 
  useRef, 
  useState 
} from 'react';

export const WasmContext = createContext<WasmContextType>({
  module: undefined,
  monotonic: -1,
  ensureModuleIsLoaded: () => false,
  invalidateState: () => {},
});

interface WasmContextType {
  module: EmscriptenModule | undefined,
  monotonic: number;
  ensureModuleIsLoaded: () => boolean,
  invalidateState: () => void,
}

function WasmContextProvider(props: React.PropsWithChildren<object>) {
  const [ instance, setInstance ] = useState<EmscriptenModule | undefined>(undefined);
  const [ inv, setInv ] = useState(0);
  const moduleIsLoading = useRef<boolean>(false);

  const invalidateState = useCallback(() => setInv((inv) => inv + 1), []);

  const contextValue: WasmContextType = useMemo(() => {
    const loadModule = () => {
      window.Module = {} as EmscriptenModule;
      window.Module.locateFile = (url, ) => url;
      
      moduleIsLoading.current = true;
      const moduleScript = document.createElement('script');
      moduleScript.type = 'text/javascript';
      moduleScript.src = '/native/build/glissando-editor.js';
      window._wasmInitialized = () => {
        console.log('JS side received that WASM module has been loaded!');
        setInstance(window.Module);
        window._wasmInitialized = undefined;
      };
      
      document.body.appendChild(moduleScript);
    };

    return {
      module: instance,
      monotonic: inv,
      ensureModuleIsLoaded: () => {
        if (instance !== undefined) return true;

        if (!moduleIsLoading.current) {
          loadModule();
        }
        return false;
      },

      invalidateState,
    };
  }, [instance, inv, invalidateState]);

  useEffect(() => {
    window._invalidateModuleContext = invalidateState;

    return () => window._invalidateModuleContext = undefined;
  }, [invalidateState]);

  return (
    <WasmContext.Provider value={contextValue}>
      {props.children}
    </WasmContext.Provider>
  )
}

export default WasmContextProvider;
