import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { Appearance, Platform, AccessibilityInfo } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import type { ThemeColors, ThemeMode } from '../constants/colors';

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
  themeMode: ThemeMode;
  fontScale: number;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  scaleSize: (size: number) => number;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { 
    themeMode, 
    currentColors, 
    isDark, 
    fontScale, 
    setThemeMode, 
    toggleTheme,
    applySystemTheme 
  } = useThemeStore();

  useEffect(() => {
    applySystemTheme();

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (themeMode === 'system') {
        applySystemTheme();
      }
    });

    return () => subscription.remove();
  }, [themeMode, applySystemTheme]);

  useEffect(() => {
    const handleFontScaleChange = async () => {
      const newScale = await AccessibilityInfo.getFontScale();
      useThemeStore.getState().setFontScale(newScale);
    };

    handleFontScaleChange();

    const subscription = AccessibilityInfo.addEventListener(
      'fontScaleChanged',
      handleFontScaleChange
    );

    return () => subscription.remove();
  }, []);

  const scaleSize = useCallback((size: number) => {
    return size * fontScale;
  }, [fontScale]);

  return (
    <ThemeContext.Provider
      value={{
        colors: currentColors,
        isDark,
        themeMode,
        fontScale,
        setThemeMode,
        toggleTheme,
        scaleSize,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function useColors(): ThemeColors {
  return useTheme().colors;
}

export function useScaleSize() {
  return useTheme().scaleSize;
}
