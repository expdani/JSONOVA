import React from 'react';
import { useThemeContext } from '../../contexts/ThemeContext';
import { ToggleWrapper, Switch, Slider, Input, IconWrapper } from './styles';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useThemeContext();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    toggleTheme(e.target.checked);
  };
  
  return (
    <ToggleWrapper>
      <IconWrapper className={!isDarkMode ? 'active' : ''}>🌞</IconWrapper>
      <Switch>
        <Input
          type="checkbox"
          checked={isDarkMode}
          onChange={handleChange}
        />
        <Slider />
      </Switch>
      <IconWrapper className={isDarkMode ? 'active' : ''}>🌙</IconWrapper>
    </ToggleWrapper>
  );
};

export default ThemeToggle;
