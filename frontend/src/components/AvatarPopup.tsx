import { useCallback } from 'react';
import { ClickAwayListener, Popper } from '@mui/base';
import { styled } from '@mui/system';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LogoutIcon from '@mui/icons-material/Logout';

import { NormalButton, YellowButton } from './NavbarButton';

interface AvatarPopupProps {
  onBlur?: () => void;
  onPasswordChange?: () => void;
  onLogout?: () => void;
  open?: boolean;
  anchorEl: HTMLElement | null;
  userFirstName: string;
  username: string;
  userEmail: string;
}

const PopupFrame = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(1),
  background: theme.palette.background.light,
  boxShadow: '2px 2px 15px rgba(0, 0, 0, 0.4)',
  borderRadius: theme.spacing(2),
  minWidth: 250,
}));

const PopupCell = styled('div')(({ theme }) => ({
  padding: `${theme.spacing(2)} ${theme.spacing(4)}`,
  '&:not(:first-of-type)': {
    borderTop: `1px solid ${theme.palette.primary.dark}40`
  },
  'button': {
    background: theme.palette.background.hover,
  },
  display: 'flex',
  placeContent: 'center',
  flexDirection: 'column',
}));

const PopupName = styled('span')(() => ({
  fontWeight: 700,
  fontSize: 20,
}));

const PopupEmail = styled('span')(() => ({
  fontSize: 15,
}));

function AvatarPopup(props: AvatarPopupProps) {
  const { onBlur } = props;

  const handleClickAway = useCallback(() => {
    if (onBlur) {
      onBlur();
    }
  }, [onBlur]);

  return (
    <>
      <Popper style={{ zIndex: 9999 }} open={!!props.open} anchorEl={props.anchorEl} placement="bottom-end">
        <ClickAwayListener onClickAway={handleClickAway}>
          <PopupFrame>
            <PopupCell>
              <PopupName>{props.userFirstName} ({props.username})</PopupName>
              <PopupEmail>{props.userEmail}</PopupEmail>
            </PopupCell>
            <PopupCell>
              <YellowButton onClick={props.onPasswordChange}><LockOutlinedIcon />&nbsp;Zmiana hasła</YellowButton>
              <span style={{ height: 16 }} />
              <NormalButton onClick={props.onLogout}><LogoutIcon />&nbsp;Wyloguj</NormalButton>
            </PopupCell>
          </PopupFrame>
        </ClickAwayListener>
      </Popper>
    </>
  );
}

export default AvatarPopup;