import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check if this is the first time the app is being used
    const hasBeenUsedBefore = localStorage.getItem('app_has_been_used');
    
    if (!hasBeenUsedBefore) {
      // First time using the app - force light mode
      localStorage.setItem('app_has_been_used', 'true');
      localStorage.removeItem('theme'); // Clear any existing theme
      return 'light';
    }
    
    // App has been used before - check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    
    // Default to light mode
    return 'light';
  });

  useEffect(() => {
    // Save theme to localStorage
    localStorage.setItem('theme', theme);
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = `theme-${theme}`;
    
    // Only apply custom CSS properties for dark mode
    // Light mode will use the original CSS styles from the CSS files
    if (theme === 'dark') {
      const root = document.documentElement;
      // High-quality dark mode custom properties
      root.style.setProperty('--color-bg', '#0a0a0a');
      root.style.setProperty('--color-bg-secondary', '#1a1a1a');
      root.style.setProperty('--color-bg-tertiary', '#2a2a2a');
      root.style.setProperty('--color-text', '#ffffff');
      root.style.setProperty('--color-text-secondary', '#e0e0e0');
      root.style.setProperty('--color-text-muted', '#a0a0a0');
      root.style.setProperty('--color-border', '#404040');
      root.style.setProperty('--color-border-light', '#2a2a2a');
      root.style.setProperty('--color-primary', '#4f46e5');
      root.style.setProperty('--color-primary-hover', '#6366f1');
      root.style.setProperty('--color-success', '#10b981');
      root.style.setProperty('--color-warning', '#f59e0b');
      root.style.setProperty('--color-error', '#ef4444');
      root.style.setProperty('--color-card', '#1a1a1a');
      root.style.setProperty('--color-sidebar', '#0a0a0a');
      root.style.setProperty('--color-navbar', '#1a1a1a');
      root.style.setProperty('--color-input', '#1a1a1a');
      root.style.setProperty('--color-input-border', '#404040');
      root.style.setProperty('--color-input-focus', '#4f46e5');
      root.style.setProperty('--color-button', '#1a1a1a');
      root.style.setProperty('--color-button-hover', '#2a2a2a');
      root.style.setProperty('--color-button-primary', '#4f46e5');
      root.style.setProperty('--color-button-primary-hover', '#6366f1');
      root.style.setProperty('--color-button-primary-text', '#ffffff');
      root.style.setProperty('--color-shadow', '0 4px 6px -1px rgba(0, 0, 0, 0.5)');
      root.style.setProperty('--color-shadow-lg', '0 10px 15px -3px rgba(0, 0, 0, 0.5)');
      root.style.setProperty('--color-shadow-xl', '0 20px 25px -5px rgba(0, 0, 0, 0.6)');
      root.style.setProperty('--color-overlay', 'rgba(0, 0, 0, 0.8)');
      root.style.setProperty('--color-scrollbar', '#404040');
      root.style.setProperty('--color-scrollbar-thumb', '#606060');
      root.style.setProperty('--color-scrollbar-track', '#1a1a1a');
      
      // Additional high-quality dark mode properties
      root.style.setProperty('--color-accent', '#8b5cf6');
      root.style.setProperty('--color-accent-hover', '#a78bfa');
      root.style.setProperty('--color-info', '#06b6d4');
      root.style.setProperty('--color-info-hover', '#22d3ee');
      root.style.setProperty('--color-surface', '#1e1e1e');
      root.style.setProperty('--color-surface-hover', '#2e2e2e');
      root.style.setProperty('--color-elevation-1', '0 1px 3px 0 rgba(0, 0, 0, 0.3)');
      root.style.setProperty('--color-elevation-2', '0 4px 6px -1px rgba(0, 0, 0, 0.4)');
      root.style.setProperty('--color-elevation-3', '0 10px 15px -3px rgba(0, 0, 0, 0.5)');
      root.style.setProperty('--color-elevation-4', '0 20px 25px -5px rgba(0, 0, 0, 0.6)');
      root.style.setProperty('--color-elevation-5', '0 25px 50px -12px rgba(0, 0, 0, 0.7)');
    } else {
      // For light mode, remove any custom CSS properties to use original CSS styles
      const root = document.documentElement;
      // Clear all custom properties for light mode
      root.style.removeProperty('--color-bg');
      root.style.removeProperty('--color-bg-secondary');
      root.style.removeProperty('--color-bg-tertiary');
      root.style.removeProperty('--color-text');
      root.style.removeProperty('--color-text-secondary');
      root.style.removeProperty('--color-text-muted');
      root.style.removeProperty('--color-border');
      root.style.removeProperty('--color-border-light');
      root.style.removeProperty('--color-primary');
      root.style.removeProperty('--color-primary-hover');
      root.style.removeProperty('--color-success');
      root.style.removeProperty('--color-warning');
      root.style.removeProperty('--color-error');
      root.style.removeProperty('--color-card');
      root.style.removeProperty('--color-sidebar');
      root.style.removeProperty('--color-navbar');
      root.style.removeProperty('--color-input');
      root.style.removeProperty('--color-input-border');
      root.style.removeProperty('--color-input-focus');
      root.style.removeProperty('--color-button');
      root.style.removeProperty('--color-button-hover');
      root.style.removeProperty('--color-button-primary');
      root.style.removeProperty('--color-button-primary-hover');
      root.style.removeProperty('--color-button-primary-text');
      root.style.removeProperty('--color-shadow');
      root.style.removeProperty('--color-shadow-lg');
      root.style.removeProperty('--color-shadow-xl');
      root.style.removeProperty('--color-overlay');
      root.style.removeProperty('--color-scrollbar');
      root.style.removeProperty('--color-scrollbar-thumb');
      root.style.removeProperty('--color-scrollbar-track');
      
      // Clear additional high-quality dark mode properties
      root.style.removeProperty('--color-accent');
      root.style.removeProperty('--color-accent-hover');
      root.style.removeProperty('--color-info');
      root.style.removeProperty('--color-info-hover');
      root.style.removeProperty('--color-surface');
      root.style.removeProperty('--color-surface-hover');
      root.style.removeProperty('--color-elevation-1');
      root.style.removeProperty('--color-elevation-2');
      root.style.removeProperty('--color-elevation-3');
      root.style.removeProperty('--color-elevation-4');
      root.style.removeProperty('--color-elevation-5');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const setThemeMode = (newTheme) => {
    setTheme(newTheme);
  };

  const resetToLightMode = () => {
    setTheme('light');
    localStorage.removeItem('theme'); // Clear saved preference
  };

  const resetAppTheme = () => {
    // Completely reset the app's theme state
    localStorage.removeItem('app_has_been_used');
    localStorage.removeItem('theme');
    setTheme('light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemeMode, resetToLightMode, resetAppTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 