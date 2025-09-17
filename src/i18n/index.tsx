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
    // Navigation
    home: 'Home',
    consult: 'Consult',
    records: 'Records',
    pharmacy: 'Pharmacy',
    profile: 'Profile',
    // Greetings
    hello: 'Hello',
    howAreYouToday: 'How are you today?',
    patientId: 'Patient ID',
    // Health Summary
    bloodPressure: 'Blood Pressure',
    nextAppointment: 'Next Appointment',
    medicinesDue: 'Medicines Due',
    tomorrow: 'Tomorrow',
    pending: 'pending',
    // Doctors
    topDoctors: 'Top Doctors',
    seeAll: 'See All',
    // Status
    normal: 'Normal',
    upcoming: 'Upcoming',
    warning: 'Warning',
    available: 'Available',
    minAway: 'min away',
    // Specialties
    cardiologist: 'Cardiologist',
    neurologist: 'Neurologist',
    dermatologist: 'Dermatologist',
    generalMedicine: 'General Medicine',
    // Other
    session: 'session',
    rating: 'Rating',
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
    // Navigation
    home: 'होम',
    consult: 'परामर्श',
    records: 'रिकॉर्ड',
    pharmacy: 'फार्मेसी',
    profile: 'प्रोफाइल',
    // Greetings
    hello: 'नमस्ते',
    howAreYouToday: 'आज आप कैसे हैं?',
    patientId: 'रोगी आईडी',
    // Health Summary
    bloodPressure: 'रक्तचाप',
    nextAppointment: 'अगली अपॉइंटमेंट',
    medicinesDue: 'दवाएं बकाया',
    tomorrow: 'कल',
    pending: 'लंबित',
    // Doctors
    topDoctors: 'शीर्ष डॉक्टर',
    seeAll: 'सभी देखें',
    // Status
    normal: 'सामान्य',
    upcoming: 'आगामी',
    warning: 'चेतावनी',
    available: 'उपलब्ध',
    minAway: 'मिनट दूर',
    // Specialties
    cardiologist: 'हृदय रोग विशेषज्ञ',
    neurologist: 'न्यूरोलॉजिस्ट',
    dermatologist: 'त्वचा विशेषज्ञ',
    generalMedicine: 'सामान्य चिकित्सा',
    // Other
    session: 'सत्र',
    rating: 'रेटिंग',
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
    // Navigation
    home: 'ਹੋਮ',
    consult: 'ਸਲਾਹ',
    records: 'ਰਿਕਾਰਡ',
    pharmacy: 'ਫਾਰਮੇਸੀ',
    profile: 'ਪ੍ਰੋਫਾਈਲ',
    // Greetings
    hello: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',
    howAreYouToday: 'ਅੱਜ ਤੁਸੀਂ ਕਿਵੇਂ ਹੋ?',
    patientId: 'ਮਰੀਜ਼ ਆਈਡੀ',
    // Health Summary
    bloodPressure: 'ਬਲੱਡ ਪ੍ਰੈਸ਼ਰ',
    nextAppointment: 'ਅਗਲੀ ਮੁਲਾਕਾਤ',
    medicinesDue: 'ਦਵਾਈਆਂ ਬਾਕੀ',
    tomorrow: 'ਕੱਲ',
    pending: 'ਲੰਬਿਤ',
    // Doctors
    topDoctors: 'ਪ੍ਰਮੁੱਖ ਡਾਕਟਰ',
    seeAll: 'ਸਾਰੇ ਦੇਖੋ',
    // Status
    normal: 'ਸਧਾਰਨ',
    upcoming: 'ਆਉਣ ਵਾਲਾ',
    warning: 'ਚੇਤਾਵਨੀ',
    available: 'ਉਪਲਬਧ',
    minAway: 'ਮਿੰਟ ਦੂਰ',
    // Specialties
    cardiologist: 'ਕਾਰਡੀਓਲੋਜਿਸਟ',
    neurologist: 'ਨਿਊਰੋਲੋਜਿਸਟ',
    dermatologist: 'ਡਰਮੇਟੋਲੋਜਿਸਟ',
    generalMedicine: 'ਜਨਰਲ ਮੈਡੀਸਨ',
    // Other
    session: 'ਸੈਸ਼ਨ',
    rating: 'ਰੇਟਿੰਗ',
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

