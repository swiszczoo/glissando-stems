import { Input } from "@mui/base";
import { styled } from "@mui/system";

const GlissandoInput = styled(Input)(({ theme }) => ({
    '& input': {
        margin: `${theme.spacing(1)} 0`,
        width: '100%',
        border: 'none',
        padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
        fontSize: 20,
        color: theme.palette.primary.main,
        background: theme.palette.background.light,
        borderRadius: 100,
        boxSizing: 'border-box',
        transition: '0.3s',
        outline: 'solid 2px transparent',
        '&:focus': {
            outline: `solid 2px ${theme.palette.primary.dark}`,
        },
    },
    '& input::placeholder': {
        color: theme.palette.primary.dark,
    }
}));

export default GlissandoInput;
