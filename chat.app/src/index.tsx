import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { ThemeProvider as AppThemeProvider, useThemeContext } from './contexts/ThemeContext';
import { darkTheme, lightTheme } from './themes/theme';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const Root = () => {
  const { isDarkMode } = useThemeContext();
  
  return (
    <EmotionThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <App />
    </EmotionThemeProvider>
  );
};

root.render(
  <React.StrictMode>
    <AppThemeProvider>
      <Root />
    </AppThemeProvider>
  </React.StrictMode>
);
