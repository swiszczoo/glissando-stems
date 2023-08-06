import { useState } from 'react';
import { styled } from '@mui/system';
import AvatarImg from '../assets/avatar-dark.svg';

import AvatarPopup from './AvatarPopup';

interface AvatarProps {
  onLogout?: () => void,

  userFirstName: string;
  userEmail: string;
  username: string;
}

const RoundImg = styled('img')(() => ({
  borderRadius: '100%',
  height: 42,
  width: 42,
  cursor: 'pointer',
}));

function Avatar(props: AvatarProps) {
  const [ popupAnchor, setPopupAnchor ] = useState<HTMLImageElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLImageElement>) => {
    setPopupAnchor(event.currentTarget);
  };

  const handleBlur = () => {
    setPopupAnchor(null);
  };

  return (
    <>
      <RoundImg src={AvatarImg} title={`${props.userFirstName} (${props.userEmail})`} onClick={handleClick} />
      <AvatarPopup
        open={!!popupAnchor}
        anchorEl={popupAnchor}
        onBlur={handleBlur}
        userFirstName={props.userFirstName}
        userEmail={props.userEmail}
        username={props.username}
        onLogout={props.onLogout}
        />
    </>
  );
}

export default Avatar;
