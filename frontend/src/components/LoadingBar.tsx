import { styled } from "@mui/system";

const LoadingBar = styled('div')(({ theme }) => `
    margin-top: ${theme.spacing(4)};
    height: ${theme.spacing(1)};
    border-radius: ${theme.spacing(1)};
    width: 100%;
    background-color: ${theme.palette.background.light};
    background: repeating-linear-gradient(45deg, ${theme.palette.primary.main} 0px, ${theme.palette.primary.main} ${theme.spacing(2)}, ${theme.palette.background.light} ${theme.spacing(2)}, ${theme.palette.background.light} ${theme.spacing(4)});
    animation: stripesAnimation 7s linear infinite;
    box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.4);
`);

export default LoadingBar;