import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import * as Localization from 'expo-localization';
import { changeLanguage, getCurrentLanguage, supportedLanguages } from '../i18n';

type LanguageCode = 'zh-CN' | 'en-US';

interface LanguageContextType {
  language: LanguageCode;
  languageName: string;
  isRTL: boolean;
  changeAppLanguage: (code: LanguageCode) => Promise<void>;
  setLanguageFromDevice: () => Promise<void>;
  supportedLanguages: typeof supportedLanguages;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState<LanguageCode>('zh-CN');
  const [isRTL, setIsRTL] = useState(false);

  const languageName = supportedLanguages.find(l => l.code === language)?.name || '简体中文';

  const changeAppLanguage = useCallback(async (code: LanguageCode) => {
    try {
      await changeLanguage(code);
      setLanguage(code);
      setIsRTL(code === 'ar' || code === 'he' || code === 'fa');
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  }, []);

  const setLanguageFromDevice = useCallback(async () => {
    try {
      const locales = Localization.getLocales();
      const deviceLocale = locales[0]?.languageTag || 'zh-CN';
      
      let targetLanguage: LanguageCode = 'zh-CN';
      
      if (deviceLocale.startsWith('en')) {
        targetLanguage = 'en-US';
      } else if (deviceLocale.startsWith('zh')) {
        targetLanguage = 'zh-CN';
      }
      
      await changeAppLanguage(targetLanguage);
    } catch (error) {
      console.error('Failed to set language from device:', error);
    }
  }, [changeAppLanguage]);

  useEffect(() => {
    const currentLang = getCurrentLanguage() as LanguageCode;
    if (currentLang) {
      setLanguage(currentLang);
    }
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        language,
        languageName,
        isRTL,
        changeAppLanguage,
        setLanguageFromDevice,
        supportedLanguages,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageProvider;
