import React, { } from 'react';
import { ClickAwayListener, Modal } from '@mui/base';
import { styled } from '@mui/system';

const Backdrop = React.forwardRef<
  HTMLDivElement,
  { open?: boolean; className: string }
>((props, ref) => {
  const { open, className, ...other } = props;
  return (
    <div
      className={className + (open ? ' MuiBackdrop-open' : '')}
      ref={ref}
      {...other}
    />
  );
});

const StyledModal = styled(Modal)`
  position: fixed;
  z-index: 1300;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledBackdrop = styled(Backdrop)(({ theme }) =>`
  z-index: -1;
  position: fixed;
  inset: 0;
  background-color: ${theme.palette.background.dark}a0;
  -webkit-tap-highlight-color: transparent;
`);

const ModalFrame = styled('div')(({ theme }) => ({
  boxSizing: 'border-box',
  margin: theme.spacing(4),
  background: theme.palette.background.main,
  width: 640,
  maxWidth: '100%',
  borderRadius: theme.spacing(2),
  boxShadow: '0px 5px 20px rgba(0, 0, 0, 0.2)',
  '&:focus-visible': {
    outline: 'none',
  }
}));

const ModalFrameSection = styled('section')(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  maxHeight: '95vh',
}));

const ModalSection = styled('div')(({ theme }) => ({
  padding: `${theme.spacing(2)} ${theme.spacing(4)}`,
  flex: 0,
  '&:not(:first-of-type)': {
    borderTop: `1px solid ${theme.palette.background.light}`
  },
  '*, * input': {
    fontSize: 16,
  }
}));

interface GlissandoModalProps {
  title: string;
  open?: boolean;
  buttons?: React.ComponentType;
  onBlur?: () => void;
}

function GlissandoModal(props: React.PropsWithChildren<GlissandoModalProps>) {
  const handleBlur = () => {
    if (props.onBlur) {
      props.onBlur();
    }
  };

  return (
    <StyledModal aria-labelledby='modal-title' open={!!props.open} slots={{ backdrop: StyledBackdrop }}>
        <ModalFrame>
          <ClickAwayListener onClickAway={handleBlur}>
            <ModalFrameSection>
              <ModalSection>
                <span id='modal-title' style={{ fontSize: 24, fontWeight: 700 }}>{props.title}</span>
              </ModalSection>
              <ModalSection style={{ overflowY: 'auto', flexShrink: 1, }}>
                {props.children}
              </ModalSection>
              {
                props.buttons && 
                <ModalSection style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}>
                  <props.buttons/>
                </ModalSection>
              }
            </ModalFrameSection>
          </ClickAwayListener>
        </ModalFrame>
    </StyledModal>
  );
}

export default GlissandoModal;