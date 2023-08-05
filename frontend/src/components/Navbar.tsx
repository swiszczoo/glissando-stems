import { styled } from "@mui/system";

import { useSession } from "../hooks/useSession";

import Avatar from "./Avatar";

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
  
  return (
    <NavbarFrame>
      <NavbarTitle>{props.title}</NavbarTitle>
      { !props.customSeparator && <NavbarSeparator /> }
      { props.children }
      <Avatar userFirstName={session.firstName || ''} userEmail={session.email || ''}/>
    </NavbarFrame>
  );
}

export default Navbar;