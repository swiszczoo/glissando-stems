import { Slider } from '@mui/base';
import { styled } from '@mui/system';
import { sliderClasses } from '@mui/base/Slider';

const GlissandoSlider = styled(Slider)(({ theme }) => `
  color: ${theme.palette.primary.main};
  height: 8px;
  width: 100%;
  padding: 16px 0;
  display: inline-block;
  position: relative;
  cursor: pointer;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    opacity: 1;
  }

  &.${sliderClasses.disabled} { 
    pointer-events: none;
    cursor: default;
    color: #888;
    opacity: 0.5;
  }

  & .${sliderClasses.rail} {
    display: block;
    position: absolute;
    width: 100%;
    height: 4px;
    border-radius: 2px;
    background-color: ${theme.palette.background.light};
  }

  & .${sliderClasses.track} {
    display: block;
    position: absolute;
    height: 4px;
    border-radius: 2px;
    background-color: ${theme.palette.primary.main};
  }

  & .${sliderClasses.thumb} {
    position: absolute;
    width: 16px;
    height: 16px;
    margin-left: -6px;
    margin-top: -6px;
    box-sizing: border-box;
    border-radius: 50%;
    outline: 0;
    background-color: ${theme.palette.primary.main};

    :hover,
    &.${sliderClasses.focusVisible} {
      box-shadow: 0 0 5px ${theme.palette.primary.main};
    }

    &.${sliderClasses.active} {
      box-shadow: 0 0 5px ${theme.palette.primary.main};
    }
  }
`);

export default GlissandoSlider;
