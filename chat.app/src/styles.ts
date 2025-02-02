import styled from '@emotion/styled';

export const AppContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  backgroundColor: props.theme.colors.background,
  color: props.theme.colors.text,
  transition: props.theme.transitions.default,
}));

export const Header = styled.header((props) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: props.theme.spacing.md,
  backgroundColor: props.theme.colors.secondary,
  color: props.theme.colors.text,
  borderBottom: `1px solid ${props.theme.colors.border}`,

  h1: {
    margin: 0,
    fontSize: '1.5rem',
  }
}));

export const ChatContainer = styled.div((props) => ({
  flex: 1,
  overflowY: 'auto',
  padding: props.theme.spacing.md,
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.spacing.md,
}));

export const Form = styled.form((props) => ({
  display: 'flex',
  gap: props.theme.spacing.sm,
  padding: props.theme.spacing.md,
  borderTop: `1px solid ${props.theme.colors.border}`,
  backgroundColor: props.theme.colors.secondary,
}));

export const Input = styled.input((props) => ({
  flex: 1,
  padding: `${props.theme.spacing.sm} ${props.theme.spacing.md}`,
  border: `1px solid ${props.theme.colors.border}`,
  borderRadius: props.theme.borderRadius.md,
  backgroundColor: props.theme.colors.background,
  color: props.theme.colors.text,
  outline: 'none',
  transition: props.theme.transitions.default,

  '&:focus': {
    borderColor: props.theme.colors.accent,
    boxShadow: `0 0 0 2px ${props.theme.colors.accent}33`,
  }
}));

export const Button = styled.button((props) => ({
  padding: `${props.theme.spacing.sm} ${props.theme.spacing.lg}`,
  backgroundColor: props.theme.colors.primary,
  color: props.theme.colors.white,
  border: 'none',
  borderRadius: props.theme.borderRadius.md,
  cursor: 'pointer',
  transition: props.theme.transitions.default,

  '&:hover': {
    backgroundColor: props.theme.colors.accent,
  },

  '&:active': {
    transform: 'translateY(1px)',
  }
}));
