import React, { createContext, useContext, useState, useCallback } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: (isDark: boolean) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
});

export const useThemeContext = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => 
    localStorage.getItem('theme') === 'dark'
  );

  const toggleTheme = useCallback((checked: boolean) => {
    setIsDarkMode(checked);
    localStorage.setItem('theme', checked ? 'dark' : 'light');
  }, []);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
