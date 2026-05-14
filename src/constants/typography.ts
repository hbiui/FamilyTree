import { Platform, PixelRatio } from 'react-native';

const fontFamilies = {
  chinese: Platform.select({
    ios: 'PingFang SC',
    android: 'Noto Sans SC',
    default: 'System',
  }),
  english: Platform.select({
    ios: 'SF Pro Text',
    android: 'Roboto',
    default: 'System',
  }),
  decorative: Platform.select({
    ios: 'Songti SC',
    android: 'Noto Serif SC',
    default: 'System',
  }),
};

const scaleFontSize = (size: number, fontScale: number = 1): number => {
  const scaled = size * fontScale;
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
};

export interface TypographyStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: '400' | '500' | '600' | '700';
  lineHeight: number;
  letterSpacing?: number;
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize';
}

export interface TypographyScaled {
  h1: (fontScale?: number) => TypographyStyle;
  h2: (fontScale?: number) => TypographyStyle;
  h3: (fontScale?: number) => TypographyStyle;
  h4: (fontScale?: number) => TypographyStyle;
  h5: (fontScale?: number) => TypographyStyle;
  body: (fontScale?: number) => TypographyStyle;
  bodySmall: (fontScale?: number) => TypographyStyle;
  caption: (fontScale?: number) => TypographyStyle;
  overline: (fontScale?: number) => TypographyStyle;
  button: (fontScale?: number) => TypographyStyle;
  buttonSmall: (fontScale?: number) => TypographyStyle;
  number: (fontScale?: number) => TypographyStyle;
}

export const Typography: TypographyScaled = {
  h1: (fontScale = 1) => ({
    fontFamily: fontFamilies.decorative,
    fontSize: scaleFontSize(32, fontScale),
    fontWeight: '700',
    lineHeight: scaleFontSize(40, fontScale),
    letterSpacing: 0.5,
  }),
  h2: (fontScale = 1) => ({
    fontFamily: fontFamilies.decorative,
    fontSize: scaleFontSize(28, fontScale),
    fontWeight: '600',
    lineHeight: scaleFontSize(36, fontScale),
    letterSpacing: 0.3,
  }),
  h3: (fontScale = 1) => ({
    fontFamily: fontFamilies.chinese,
    fontSize: scaleFontSize(24, fontScale),
    fontWeight: '600',
    lineHeight: scaleFontSize(32, fontScale),
  }),
  h4: (fontScale = 1) => ({
    fontFamily: fontFamilies.chinese,
    fontSize: scaleFontSize(20, fontScale),
    fontWeight: '600',
    lineHeight: scaleFontSize(28, fontScale),
  }),
  h5: (fontScale = 1) => ({
    fontFamily: fontFamilies.chinese,
    fontSize: scaleFontSize(18, fontScale),
    fontWeight: '500',
    lineHeight: scaleFontSize(26, fontScale),
  }),
  body: (fontScale = 1) => ({
    fontFamily: fontFamilies.chinese,
    fontSize: scaleFontSize(16, fontScale),
    fontWeight: '400',
    lineHeight: scaleFontSize(24, fontScale),
  }),
  bodySmall: (fontScale = 1) => ({
    fontFamily: fontFamilies.chinese,
    fontSize: scaleFontSize(14, fontScale),
    fontWeight: '400',
    lineHeight: scaleFontSize(20, fontScale),
  }),
  caption: (fontScale = 1) => ({
    fontFamily: fontFamilies.chinese,
    fontSize: scaleFontSize(12, fontScale),
    fontWeight: '400',
    lineHeight: scaleFontSize(16, fontScale),
  }),
  overline: (fontScale = 1) => ({
    fontFamily: fontFamilies.english,
    fontSize: scaleFontSize(10, fontScale),
    fontWeight: '500',
    lineHeight: scaleFontSize(14, fontScale),
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  }),
  button: (fontScale = 1) => ({
    fontFamily: fontFamilies.chinese,
    fontSize: scaleFontSize(16, fontScale),
    fontWeight: '600',
    lineHeight: scaleFontSize(24, fontScale),
  }),
  buttonSmall: (fontScale = 1) => ({
    fontFamily: fontFamilies.chinese,
    fontSize: scaleFontSize(14, fontScale),
    fontWeight: '500',
    lineHeight: scaleFontSize(20, fontScale),
  }),
  number: (fontScale = 1) => ({
    fontFamily: fontFamilies.english,
    fontSize: scaleFontSize(24, fontScale),
    fontWeight: '600',
    lineHeight: scaleFontSize(32, fontScale),
  }),
};

export const FontFamilies = fontFamilies;
