import styled from '@emotion/styled';

export const ToggleWrapper = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

export const Switch = styled.label({
  position: 'relative',
  display: 'inline-block',
  width: '48px',
  height: '24px',
});

export const Input = styled.input((props) => ({
  opacity: 0,
  width: 0,
  height: 0,

  '&:checked + span': {
    backgroundColor: props.theme.colors.primary,
  },

  '&:checked + span:before': {
    transform: 'translateX(24px)',
  },
}));

export const Slider = styled.span((props) => ({
  position: 'absolute',
  cursor: 'pointer',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: props.theme.colors.secondary,
  transition: '0.4s',
  borderRadius: '24px',

  '&:before': {
    position: 'absolute',
    content: '""',
    height: '18px',
    width: '18px',
    left: '3px',
    bottom: '3px',
    backgroundColor: props.theme.colors.white,
    transition: '0.4s',
    borderRadius: '50%',
  },
}));

export const IconWrapper = styled.span({
  fontSize: '16px',
  opacity: 0.5,
  transition: 'opacity 0.3s ease',

  '&.active': {
    opacity: 1,
  },
});
