import React from 'react';
import { Option, Popper, PopperProps, Select } from '@mui/base';
import { SelectProps } from '@mui/base/Select';
import { optionClasses } from '@mui/base/Option';
import { styled } from '@mui/system';

export const GlissandoSelect = React.forwardRef(function CustomSelect<
  TValue extends NonNullable<unknown>,
  Multiple extends boolean,
>(props: SelectProps<TValue, Multiple>, ref: React.ForwardedRef<HTMLButtonElement>) {
  const slots = {
    root: SelectButton,
    listbox: SelectListbox,
    popper: SelectPopper,
    ...props.slots,
  };

  return <Select {...props} ref={ref} slots={slots} />;
});

const SelectButton = styled('button')(({ theme }) => ({
  margin: `${theme.spacing(1)} 0`,
  width: '100%',
  border: 'none',
  padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
  fontSize: 20,
  color: theme.palette.primary.main,
  background: theme.palette.background.light,
  borderRadius: 100,
  boxSizing: 'border-box',
  transition: '0.1s',
  outline: 'solid 2px transparent',
  textAlign: 'left',
  '&:not(:disabled):hover, &:focus-visible': {
    background: `${theme.palette.primary.main}40`,
    boxShadow: `0 0 10px ${theme.palette.primary.main}40`,
  },
  '&:not(:disabled):hover:active, &:not(:disabled).active': {
      transition: 'none',
      background: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
  },
  '&:disabled': {
      cursor: 'not-allowed',
      color: theme.palette.primary.dark,
  },
  '&::after': {
    content: '"\u25bc"',
    float: 'right',
  },
}));

const SelectListbox = styled('ul')(({ theme }) => ({
  background: theme.palette.background.main,
  overflowY: 'scroll',
  maxHeight: 300,
  boxShadow: '0 0 10px black',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1),
  cursor: 'default',
}));

const SelectPopperBase = styled(Popper)(() => ({
  zIndex: 5000,
}));

const SelectPopper = React.forwardRef((props: PopperProps, ref: React.ForwardedRef<HTMLLIElement>) => {
  return <SelectPopperBase {...props} ref={ref} style={{ ...props.style, width: (props.anchorEl as HTMLElement)?.clientWidth }}/>
});

export const GlissandoOption = styled(Option)(({ theme }) => {
  const styles: Record<string, string | object | number> = {
    listStyle: 'none',
    padding: `${theme.spacing(0.5)} ${theme.spacing(3)}`,
    borderRadius: 100,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    height: 30,
    alignItems: 'center',
    '& div': {
      position: 'relative',
      height: '100%',
    },
    '& img': {
      position: 'relative',
      height: '100%',
      marginRight: theme.spacing(1),
      filter: 'invert(77%) sepia(11%) saturate(1331%) hue-rotate(177deg) brightness(91%) contrast(87%)',
    },
    '& div:has(*)::after': {
      content: '""',
      zIndex: 5001,
      position: 'absolute',
      left: 0,
      top: 0,
      right: theme.spacing(1),
      height: '100%',
      outline: `1px solid ${theme.palette.primary.dark}`,
    }
  };

  styles[`&.${optionClasses.selected}`] = {
    background: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  };

  styles[`&.${optionClasses.highlighted}`] = {
    background: theme.palette.background.light,
  };

  styles[`&.${optionClasses.highlighted}.${optionClasses.selected}`] = {
    background: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  };

  styles[`&.${optionClasses.selected} img`] = {
    filter: 'invert(3%) sepia(4%) saturate(6190%) hue-rotate(169deg) brightness(106%) contrast(92%)',
  };

  styles[`&:hover:not(.${optionClasses.disabled}):not(.${optionClasses.selected})`] = {
    background: theme.palette.background.light,
  }

  return styles;
});
