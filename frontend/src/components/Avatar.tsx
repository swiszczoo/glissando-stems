import { styled } from '@mui/system';
import AvatarImg from '../assets/avatar-dark.svg';

interface AvatarProps {
  userFirstName: string;
  userEmail: string;
}

const RoundImg = styled('img')(() => ({
  borderRadius: '100%',
  height: 42,
  width: 42,
}));

function Avatar(props: AvatarProps) {
  return <RoundImg src={AvatarImg} title={`${props.userFirstName} (${props.userEmail})`}></RoundImg>
}

export default Avatar;
