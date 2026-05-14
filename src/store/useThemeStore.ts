import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Appearance } from 'react-native';
import type { ThemeMode, ThemeColors } from '../constants/colors';
import { LightColors, DarkColors } from '../constants/colors';

interface ThemeState {
  themeMode: ThemeMode;
  currentColors: ThemeColors;
  isDark: boolean;
  fontScale: number;

  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setFontScale: (scale: number) => void;
  applySystemTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeMode: 'system',
      currentColors: LightColors,
      isDark: false,
      fontScale: 1,

      setThemeMode: (mode) => {
        set({ themeMode: mode });
        
        let isDark = false;
        let colors = LightColors;
        
        if (mode === 'dark') {
          isDark = true;
          colors = DarkColors;
        } else if (mode === 'system') {
          isDark = Appearance.getColorScheme() === 'dark';
          colors = isDark ? DarkColors : LightColors;
        }
        
        set({ isDark, currentColors: colors });
      },

      toggleTheme: () => {
        const { themeMode, isDark } = get();
        
        if (themeMode === 'system') {
          set({ themeMode: isDark ? 'light' : 'dark' });
          set({ isDark: !isDark, currentColors: isDark ? LightColors : DarkColors });
        } else {
          const newMode: ThemeMode = themeMode === 'light' ? 'dark' : 'light';
          get().setThemeMode(newMode);
        }
      },

      setFontScale: (scale) => {
        const clampedScale = Math.max(0.8, Math.min(1.5, scale));
        set({ fontScale: clampedScale });
      },

      applySystemTheme: () => {
        const colorScheme = Appearance.getColorScheme();
        const isDark = colorScheme === 'dark';
        
        set({ 
          isDark, 
          currentColors: isDark ? DarkColors : LightColors 
        });
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);
