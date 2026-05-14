export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  secondary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    card: string;
    overlay: string;
  };
  accent: {
    gold: string;
    amber: string;
    bronze: string;
  };
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  gender: {
    male: string;
    female: string;
    unknown: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    disabled: string;
  };
  border: {
    light: string;
    default: string;
    dark: string;
  };
  shadow: {
    color: string;
  };
  transparent: string;
}

export const LightColors: ThemeColors = {
  primary: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  secondary: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  background: {
    primary: '#FFFBF5',
    secondary: '#FFF8F0',
    tertiary: '#F5F0E8',
    card: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  accent: {
    gold: '#D4A574',
    amber: '#F59E0B',
    bronze: '#CD7F32',
  },
  semantic: {
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    info: '#2563EB',
  },
  gender: {
    male: '#3B82F6',
    female: '#EC4899',
    unknown: '#9CA3AF',
  },
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
    disabled: '#D1D5DB',
  },
  border: {
    light: '#F3F4F6',
    default: '#E5E7EB',
    dark: '#D1D5DB',
  },
  shadow: {
    color: 'rgba(0, 0, 0, 0.08)',
  },
  transparent: 'transparent',
};

export const DarkColors: ThemeColors = {
  primary: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  secondary: {
    50: '#374151',
    100: '#4B5563',
    200: '#6B7280',
    300: '#9CA3AF',
    400: '#D1D5DB',
    500: '#E5E7EB',
    600: '#F3F4F6',
    700: '#F9FAFB',
    800: '#FFFFFF',
    900: '#FFFFFF',
  },
  background: {
    primary: '#1C1917',
    secondary: '#292524',
    tertiary: '#374151',
    card: '#292524',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  accent: {
    gold: '#D4A574',
    amber: '#F59E0B',
    bronze: '#CD7F32',
  },
  semantic: {
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
  },
  gender: {
    male: '#60A5FA',
    female: '#F472B6',
    unknown: '#9CA3AF',
  },
  text: {
    primary: '#F9FAFB',
    secondary: '#D1D5DB',
    tertiary: '#9CA3AF',
    inverse: '#1F2937',
    disabled: '#6B7280',
  },
  border: {
    light: '#4B5563',
    default: '#374151',
    dark: '#1F2937',
  },
  shadow: {
    color: 'rgba(0, 0, 0, 0.3)',
  },
  transparent: 'transparent',
};

export const Colors = LightColors;
