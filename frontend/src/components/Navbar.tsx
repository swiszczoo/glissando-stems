import { useRef, useState } from 'react';
import { styled } from "@mui/system";

import { useAxios } from "../hooks/useAxios";
import { useSession } from "../hooks/useSession";

import Avatar from "./Avatar";
import ChangePasswordModal from "./ChangePasswordModal";

const NavbarFrame = styled('nav')(({ theme }) => ({
  width: '100%',
  height: 56,
  borderBottom: `1px solid ${theme.palette.background.light}`,
  display: 'flex',
  padding: `0px ${theme.spacing(2)}`,
  boxSizing: 'border-box',
  alignItems: 'center',
  justifyContent: 'flex-end',
}));

const NavbarTitle = styled('span')(() => ({
  fontSize: 20,
  fontWeight: 700,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
}));

export const NavbarSeparator = styled('div')(() => ({
  flexGrow: 1,
}));

interface NavbarProps {
  customSeparator?: boolean;
  title: string;
}

function Navbar(props: React.PropsWithChildren<NavbarProps>) {
  const session = useSession();
  const axios = useAxios();
  const modalKey = useRef(1);
  const [ modalOpen, setModalOpen ] = useState(false);

  const handleLogout = () => {
    axios.post('/api/user/logout').then(() => {
      session.invalidateSession();
    }).catch(() => {
      session.invalidateSession();
    });
  };

  const handlePasswordChange = () => {
    ++modalKey.current;
    setModalOpen(true);
  };

  const handlePasswordCancel = () => {
    setModalOpen(false);
  }
  
  return (
    <>
      <NavbarFrame>
        <NavbarTitle>{props.title}</NavbarTitle>
        { !props.customSeparator && <NavbarSeparator /> }
        { props.children }
        <Avatar 
          userFirstName={session.firstName || ''} 
          userEmail={session.email || ''}
          username={session.login || ''} 
          onLogout={handleLogout}
          onPasswordChange={handlePasswordChange} />
      </NavbarFrame>
      <ChangePasswordModal open={modalOpen} key={modalKey.current} onBlur={handlePasswordCancel}/>
    </>
  );
}

export default Navbar;