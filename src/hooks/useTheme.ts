import { useState, useEffect, useCallback } from 'react';
import { ThemeMode } from '../types';
import { getThemeSetting, setThemeSetting } from '../services/settings';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  const applyTheme = useCallback((currentTheme: ThemeMode) => {
    let effectiveTheme: 'light' | 'dark' = 'light';

    if (currentTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = prefersDark ? 'dark' : 'light';
    } else {
      effectiveTheme = currentTheme;
    }

    setResolvedTheme(effectiveTheme);
    const root = document.documentElement;
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    // Load persisted theme
    getThemeSetting().then((saved) => {
      setThemeState(saved);
      applyTheme(saved);
    });

    // Listen to OS system color-scheme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      // Re-apply if system theme is selected
      setThemeState((curr) => {
        if (curr === 'system') {
          applyTheme('system');
        }
        return curr;
      });
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [applyTheme]);

  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    try {
      await setThemeSetting(newTheme);
    } catch (err) {
      console.error('Failed to persist theme setting:', err);
    }
  };

  return {
    theme,
    resolvedTheme,
    setTheme,
  };
}
