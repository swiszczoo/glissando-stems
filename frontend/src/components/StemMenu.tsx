import { ClickAwayListener, Popper } from '@mui/base';
import { styled } from '@mui/system';

import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';


const MenuFrame = styled('ul')(({ theme }) => ({
  padding: 0,
  background: theme.palette.background.main,
  boxShadow: `0 0 10px black`,
  margin: 0,
  minWidth: 200,
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
}));

const MenuItem = styled('li')(({ theme }) => ({
  listStyle: 'none',
  display: 'flex',
  padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
  flexDirection: 'row',
  flexWrap: 'nowrap',
  alignItems: 'center',
  justifyContent: 'flex-start',
  userSelect: 'none',
  cursor: 'pointer',
  '&:not(:last-of-type)': {
    borderBottom: `1px solid ${theme.palette.background.light}`,
  },
  '&:hover': {
    background: theme.palette.background.light,
  },
  '& > a': {
    margin: `-${theme.spacing(1)} -${theme.spacing(2)}`,
    padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    color: 'currentColor',
    textDecoration: 'none',
  },
}));

interface StemMenuProps {
  open?: boolean;
  onBlur?: () => void;
  anchorEl: HTMLElement | null;
  losslessStemUrl: string;
  downloadFilename: string;
}

function StemMenu(props: StemMenuProps) {
  const handleClickAway = () => {
    if (props.onBlur) {
      props.onBlur();
    }
  };

  return (
    <Popper style={{ zIndex: 9999}} open={!!props.open} anchorEl={props.anchorEl} placement='right'>
      <ClickAwayListener onClickAway={handleClickAway}>
        <MenuFrame role='menu'>
          <MenuItem><SettingsRoundedIcon />&nbsp;Edytuj ścieżkę</MenuItem>
          <MenuItem>
            <a href={props.losslessStemUrl} download={props.downloadFilename}>
              <DownloadRoundedIcon />&nbsp;Pobierz
            </a>
          </MenuItem>
          <MenuItem><DeleteRoundedIcon />&nbsp;Usuń</MenuItem>
        </MenuFrame>
      </ClickAwayListener>
    </Popper>
  );
}

export default StemMenu;
