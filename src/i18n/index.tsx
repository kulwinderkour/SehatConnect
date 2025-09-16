import React, { createContext, useContext, useMemo, useState } from 'react';

type SupportedLanguage = 'en' | 'hi' | 'pa';

type Translations = Record<string, string>;

const translationsByLang: Record<SupportedLanguage, Translations> = {
  en: {
    appName: 'SehatConnect',
    languageEnglish: 'English',
    languageHindi: 'Hindi',
    languagePunjabi: 'Punjabi',
    videoConsult: 'Video Consult',
    emergency: 'Emergency',
    aiChecker: 'AI Checker',
    schedule: 'Schedule',
    healthSummary: 'Health Summary',
    nearbyServices: 'Nearby Services',
  },
  hi: {
    appName: 'सेहत कनेक्ट',
    languageEnglish: 'अंग्रेज़ी',
    languageHindi: 'हिंदी',
    languagePunjabi: 'ਪੰਜਾਬੀ',
    videoConsult: 'वीडियो परामर्श',
    emergency: 'आपातकाल',
    aiChecker: 'एआई चेकर',
    schedule: 'समय-सारणी',
    healthSummary: 'स्वास्थ्य सारांश',
    nearbyServices: 'निकट सेवाएँ',
  },
  pa: {
    appName: 'ਸਿਹਤ ਕਨੈਕਟ',
    languageEnglish: 'ਅੰਗਰੇਜ਼ੀ',
    languageHindi: 'ਹਿੰਦੀ',
    languagePunjabi: 'ਪੰਜਾਬੀ',
    videoConsult: 'ਵੀਡੀਓ ਸਲਾਹ',
    emergency: 'ਐਮਰਜੈਂਸੀ',
    aiChecker: 'ਏਆਈ ਚੈੱਕਰ',
    schedule: 'ਸ਼ਡਿਊਲ',
    healthSummary: 'ਸਿਹਤ ਸੰਖੇਪ',
    nearbyServices: 'ਨੇੜਲੇ ਸੇਵਾਵਾਂ',
  },
};

type I18nContextValue = {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
  cycleLanguage: () => void;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<SupportedLanguage>('en');

  const value = useMemo<I18nContextValue>(() => {
    const t = (key: string) => {
      const table = translationsByLang[language];
      return table[key] ?? key;
    };

    const cycleLanguage = () => {
      setLanguage(prev => (prev === 'en' ? 'hi' : prev === 'hi' ? 'pa' : 'en'));
    };

    return { language, setLanguage, t, cycleLanguage };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export function getLanguageName(lang: SupportedLanguage, locale: SupportedLanguage): string {
  const map: Record<SupportedLanguage, keyof typeof translationsByLang.en> = {
    en: 'languageEnglish',
    hi: 'languageHindi',
    pa: 'languagePunjabi',
  };
  const key = map[lang];
  const table = translationsByLang[locale];
  return table[key] ?? key;
}

export type { SupportedLanguage };

