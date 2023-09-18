import { 
  createContext, 
  memo,
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
  module: GlissandoModule | undefined,
  monotonic: number;
  ensureModuleIsLoaded: () => boolean,
  invalidateState: () => void,
}

const WasmContextProvider = memo(function (props: React.PropsWithChildren<object>) {
  const [ instance, setInstance ] = useState<GlissandoModule | undefined>(window.Module);
  const [ inv, setInv ] = useState(0);
  const moduleIsLoading = useRef<boolean>(false);

  if (instance) {
    moduleIsLoading.current = false;
  }

  const invalidateState = useCallback(() => setInv((inv) => inv + 1), []);

  const contextValue: WasmContextType = useMemo(() => {
    const loadModule = () => {
      window.Module = {} as GlissandoModule;
      window.Module.locateFile = (url, ) => url;
      
      moduleIsLoading.current = true;
      const moduleScript = document.createElement('script');
      moduleScript.type = 'text/javascript';
      moduleScript.src = (
        import.meta.env.MODE === 'production' 
        ? `/static/wasm/glissando-editor.js?t=${BUILD_TIMESTAMP}` // for production
        : `/native/build/glissando-editor.js?t=${BUILD_TIMESTAMP}` // for development
      );
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
});

WasmContextProvider.displayName = 'Memo(WasmContextProvider)';

export default WasmContextProvider;
