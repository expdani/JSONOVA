const baseTheme = {
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    round: '9999px',
  },
  transitions: {
    default: 'all 0.3s ease',
  },
  colors: {
    background: '',
    text: '',
    primary: '',
    secondary: '',
    accent: '',
    border: '',
    white: '#fff',
    gray: '#90a4ae',
  }
};

export type ThemeType = typeof baseTheme;

export const lightTheme: ThemeType = {
  ...baseTheme,
  colors: {
    ...baseTheme.colors,
    background: '#ffffff',
    text: '#000000',
    primary: '#2d4a63',    
    secondary: '#f5f5f5', 
    accent: '#fff3e0',     
    border: '#e2e8f0',
  }
};

export const darkTheme: ThemeType = {
  ...baseTheme,
  colors: {
    ...baseTheme.colors,
    background: '#111827',
    text: '#ffffff',
    primary: '#2d4a63',   
    secondary: '#2d2d2d', 
    accent: '#1e293b',
    border: '#334155',
  }
};

export const getTheme = (isDark: boolean): ThemeType => {
  return isDark ? darkTheme : lightTheme;
};