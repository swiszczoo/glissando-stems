import { Tab, Tabs, TabsList, TabPanel } from '@mui/base';
import { styled } from '@mui/system';

import { tabClasses } from '@mui/base/Tab';

export const GlissandoTabs = Tabs;

export const GlissandoTabsList = styled(TabsList)(({ theme }) => `
  margin-top: -${theme.spacing(1)};
  margin-bottom: ${theme.spacing(4)};
  display: flex;
  flex-direction: row;
  justify-content: center;
`);

export const GlissandoTab = styled(Tab)(({ theme }) => `
  background: ${theme.palette.background.main};
  border: none;
  color: ${theme.palette.primary.dark};
  font-weight: 700;
  padding: ${theme.spacing(1)} ${theme.spacing(4)};
  border-bottom: ${theme.spacing(0.3)} solid transparent;
  transition: 0.2s;
  &:hover {
    background: ${theme.palette.background.light};
    border-bottom-color: ${theme.palette.primary.dark};
  };
  &.${tabClasses.selected} {
    color: ${theme.palette.primary.main};
    border-bottom-color: ${theme.palette.primary.main};
  };
`);

export const GlissandoTabPanel = styled(TabPanel)`
`;


