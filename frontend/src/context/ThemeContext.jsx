import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = [
  {
    id: 'soft-maroon',
    name: 'Soft Maroon',
    shortName: 'Soft Maroon',
    icon: '🌸',
    tone: 'light',
    accentColor: '#800020',
    bgColor: '#F7EAE7',
    description: 'Luminous warm soft maroon background with black & red maroon letters',
  },
  {
    id: 'bright-maroon',
    name: 'Rich Maroon',
    shortName: 'Rich Maroon',
    icon: '🍷',
    tone: 'dark',
    accentColor: '#85142B',
    bgColor: '#7A1226',
    description: 'Vibrant rich wine maroon canvas',
  },
  {
    id: 'warm-brown',
    name: 'Warm Brown',
    shortName: 'Warm Brown',
    icon: '🌰',
    tone: 'dark',
    accentColor: '#8B4513',
    bgColor: '#6A3219',
    description: 'Rich warm spiced cinnamon & chestnut brown canvas',
  },
  {
    id: 'soft-brown',
    name: 'Soft Amber Sand',
    shortName: 'Soft Brown',
    icon: '🍯',
    tone: 'light',
    accentColor: '#78350F',
    bgColor: '#F7EFE8',
    description: 'Luminous warm golden-brown sand canvas',
  },
];

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem('dineeasy_theme');
      if (saved === 'soft-maroon') {
        return 'soft-maroon';
      }
    } catch (e) {
      // ignore localStorage errors
    }
    return 'soft-maroon'; // Default per user request: keep the soft maroon
  });

  const activeThemeMeta = THEMES.find((t) => t.id === theme) || THEMES[0];

  useEffect(() => {
    try {
      localStorage.setItem('dineeasy_theme', theme);
    } catch (e) {
      // ignore
    }

    // Apply attributes to body & documentElement for global CSS scoping
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-tone', activeThemeMeta.tone);
    document.body.setAttribute('data-theme', theme);
    document.body.setAttribute('data-tone', activeThemeMeta.tone);
  }, [theme, activeThemeMeta]);

  const setTheme = (themeId) => {
    if (THEMES.some((t) => t.id === themeId)) {
      setThemeState(themeId);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        themes: THEMES,
        activeThemeMeta,
        isDarkTone: activeThemeMeta.tone === 'dark',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
