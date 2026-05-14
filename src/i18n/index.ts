import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';

export const resources = {
  'zh-CN': {
    translation: zhCN,
  },
  'en-US': {
    translation: enUS,
  },
};

export const supportedLanguages = [
  { code: 'zh-CN', name: '简体中文', nativeName: '简体中文' },
  { code: 'en-US', name: 'English', nativeName: 'English' },
];

export const getDeviceLanguage = (): string => {
  const locale = Localization.getLocales()[0];
  const languageTag = locale?.languageTag || 'zh-CN';
  
  if (languageTag.startsWith('zh')) {
    return 'zh-CN';
  }
  
  if (languageTag.startsWith('en')) {
    return 'en-US';
  }
  
  return 'zh-CN';
};

export const initI18n = (initialLanguage?: string) => {
  const language = initialLanguage || getDeviceLanguage();
  
  i18n.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: 'zh-CN',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
  
  return i18n;
};

export const changeLanguage = async (languageCode: string) => {
  await i18n.changeLanguage(languageCode);
};

export const getCurrentLanguage = (): string => {
  return i18n.language;
};

export default i18n;
