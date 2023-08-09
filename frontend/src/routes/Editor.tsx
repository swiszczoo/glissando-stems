import { useEffect } from "react";
import { styled } from "@mui/system";
import Logo from '../assets/logo.svg';

import LoadingBar from "../components/LoadingBar";
import SolidBackgroundFrame from "../components/SolidBackgroundFrame";

import useNative from "../hooks/useNative";

const Frame = styled('div')(({ theme }) => `
  box-sizing: border-box;
  margin: auto;
  width: 500px;
  max-width: 95vw;
  padding: ${theme.spacing(4)};
  border-radius: ${theme.spacing(2)};
  display: flex;
  flex-direction: column;
  align-items: center;
`);

function LoaderContent() {
  return (
    <Frame>
      <img src={Logo} style={{ width: '100%' }}/>
      <br/>
      <LoadingBar/>
      <p>Trwa ładowanie edytora... Proszę czekać</p>
    </Frame>
  );
}

function EditorContent() {
  const native = useNative();

  const loading = !native;
  return (
    <SolidBackgroundFrame>
      { loading && <LoaderContent/> }
    </SolidBackgroundFrame>
  );
}

function EditorRoute() {
  useEffect(() => () => {
    if (window.audioContext) {
      window.audioContext.suspend(); // Ensure to kill audio context while leaving editor
    }
  });

  return (
    <EditorContent/>
  );
}

export default EditorRoute;