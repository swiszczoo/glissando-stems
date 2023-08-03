import { Button } from "@mui/base";
import { styled } from "@mui/system";

const GlissandoButton = styled(Button)(({ theme }) => ({
    boxSizing: 'border-box',
    background: theme.palette.primary.main,
    border: 'none',
    outline: 'none',
    color: theme.palette.primary.contrastText,
    fontSize: 20,
    padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
    borderRadius: 100,
    fontWeight: 700,
    transition: '0.1s',
    cursor: 'pointer',
    '&:not(:disabled):hover, &:focus': {
        background: theme.palette.primary.light,
        boxShadow: `0 0 10px ${theme.palette.primary.dark}`
    },
    '&:not(:disabled):hover:active': {
        background: theme.palette.primary.dark,
    },
    '&:disabled': {
        cursor: 'not-allowed',
        background: theme.palette.background.light,
        color: theme.palette.primary.main,
    }
}));

export default GlissandoButton;