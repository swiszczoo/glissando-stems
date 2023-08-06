import { Button } from "@mui/base";
import { styled } from "@mui/system";

const makeNavbarButton = (textColor: string) => styled(Button)(({ theme }) => ({
    boxSizing: 'border-box',
    background: theme.palette.background.light,
    border: 'none',
    outline: 'none',
    color: textColor,
    fontSize: 15,
    padding: `${theme.spacing(1)} ${theme.spacing(3)}`,
    borderRadius: 100,
    fontWeight: 700,
    transition: '0.1s',
    cursor: 'pointer',
    display: 'flex',
    placeContent: 'center',
    placeItems: 'center',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    '&:not(:disabled):hover, &:focus': {
        background: `${textColor}40`,
        boxShadow: `0 0 10px ${textColor}40`
    },
    '&:not(:disabled):hover:active': {
        transition: 'none',
        background: textColor,
        color: theme.palette.primary.contrastText,
    },
    '&:disabled': {
        cursor: 'not-allowed',
        color: theme.palette.primary.dark,
    },
    '& *': {
      fontSize: 20,
    }
}));

export const NormalButton = makeNavbarButton('#8cb2d9');
export const GreenButton = makeNavbarButton('#0fad0f');
export const YellowButton = makeNavbarButton('#acad0f');
export const RedButton = makeNavbarButton('#d13b32');
