import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';

// Custom language type definitions
type AppLanguage = 'en' | 'hi' | 'pa';

// Custom translation interface
interface TranslationMap {
  [key: string]: string;
}

// Custom language configuration
interface LanguageConfig {
  code: AppLanguage;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
}

// Custom language configurations
const languageConfigs: Record<AppLanguage, LanguageConfig> = {
  en: { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr' },
  hi: { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', direction: 'ltr' },
  pa: { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', direction: 'ltr' },
};

// Custom translation data structure
const appTranslations: Record<AppLanguage, TranslationMap> = {
  en: {
    // App branding
    appTitle: 'SehatConnect',
    // Language selection
    langEnglish: 'English',
    langHindi: 'Hindi', 
    langPunjabi: 'Punjabi',
    // Quick actions
    actionVideoConsult: 'Video Consult',
    actionEmergency: 'Emergency',
    actionAIChecker: 'AI Checker',
    actionSchedule: 'Schedule',
    // Navigation
    navHome: 'Home',
    navConsult: 'Consult',
    navRecords: 'Records',
    navPharmacy: 'Pharmacy',
    navProfile: 'Profile',
    // User interface
    greetingHello: 'Hello',
    greetingHowAreYou: 'How are you today?',
    userPatientId: 'Patient ID',
    // Health data
    healthSummaryTitle: 'Health Summary',
    healthBloodPressure: 'Blood Pressure',
    healthNextAppointment: 'Next Appointment',
    healthMedicinesDue: 'Medicines Due',
    // Time references
    timeTomorrow: 'Tomorrow',
    timePending: 'pending',
    // Doctor information
    doctorsTopDoctors: 'Top Doctors',
    doctorsSeeAll: 'See All',
    doctorsSession: 'session',
    doctorsFreeConsultation: 'Free Consultation',
    // Medical specialties
    specialtyCardiologist: 'Cardiologist',
    specialtyNeurologist: 'Neurologist',
    specialtyDermatologist: 'Dermatologist',
    specialtyGeneralMedicine: 'General Medicine',
    // Status indicators
    statusNormal: 'Normal',
    statusUpcoming: 'Upcoming',
    statusWarning: 'Warning',
    statusAvailable: 'Available',
    statusMinAway: 'min away',
  },
  hi: {
    // App branding
    appTitle: 'सेहत कनेक्ट',
    // Language selection
    langEnglish: 'अंग्रेज़ी',
    langHindi: 'हिंदी',
    langPunjabi: 'ਪੰਜਾਬੀ',
    // Quick actions
    actionVideoConsult: 'वीडियो परामर्श',
    actionEmergency: 'आपातकाल',
    actionAIChecker: 'एआई चेकर',
    actionSchedule: 'समय-सारणी',
    // Navigation
    navHome: 'होम',
    navConsult: 'परामर्श',
    navRecords: 'रिकॉर्ड',
    navPharmacy: 'फार्मेसी',
    navProfile: 'प्रोफाइल',
    // User interface
    greetingHello: 'नमस्ते',
    greetingHowAreYou: 'आज आप कैसे हैं?',
    userPatientId: 'रोगी आईडी',
    // Health data
    healthSummaryTitle: 'स्वास्थ्य सारांश',
    healthBloodPressure: 'रक्तचाप',
    healthNextAppointment: 'अगली अपॉइंटमेंट',
    healthMedicinesDue: 'दवाएं बकाया',
    // Time references
    timeTomorrow: 'कल',
    timePending: 'लंबित',
    // Doctor information
    doctorsTopDoctors: 'शीर्ष डॉक्टर',
    doctorsSeeAll: 'सभी देखें',
    doctorsSession: 'सत्र',
    doctorsFreeConsultation: 'मुफ्त परामर्श',
    // Medical specialties
    specialtyCardiologist: 'हृदय रोग विशेषज्ञ',
    specialtyNeurologist: 'न्यूरोलॉजिस्ट',
    specialtyDermatologist: 'त्वचा विशेषज्ञ',
    specialtyGeneralMedicine: 'सामान्य चिकित्सा',
    // Status indicators
    statusNormal: 'सामान्य',
    statusUpcoming: 'आगामी',
    statusWarning: 'चेतावनी',
    statusAvailable: 'उपलब्ध',
    statusMinAway: 'मिनट दूर',
  },
  pa: {
    // App branding
    appTitle: 'ਸਿਹਤ ਕਨੈਕਟ',
    // Language selection
    langEnglish: 'ਅੰਗਰੇਜ਼ੀ',
    langHindi: 'ਹਿੰਦੀ',
    langPunjabi: 'ਪੰਜਾਬੀ',
    // Quick actions
    actionVideoConsult: 'ਵੀਡੀਓ ਸਲਾਹ',
    actionEmergency: 'ਐਮਰਜੈਂਸੀ',
    actionAIChecker: 'ਏਆਈ ਚੈੱਕਰ',
    actionSchedule: 'ਸ਼ਡਿਊਲ',
    // Navigation
    navHome: 'ਹੋਮ',
    navConsult: 'ਸਲਾਹ',
    navRecords: 'ਰਿਕਾਰਡ',
    navPharmacy: 'ਫਾਰਮੇਸੀ',
    navProfile: 'ਪ੍ਰੋਫਾਈਲ',
    // User interface
    greetingHello: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',
    greetingHowAreYou: 'ਅੱਜ ਤੁਸੀਂ ਕਿਵੇਂ ਹੋ?',
    userPatientId: 'ਮਰੀਜ਼ ਆਈਡੀ',
    // Health data
    healthSummaryTitle: 'ਸਿਹਤ ਸੰਖੇਪ',
    healthBloodPressure: 'ਬਲੱਡ ਪ੍ਰੈਸ਼ਰ',
    healthNextAppointment: 'ਅਗਲੀ ਮੁਲਾਕਾਤ',
    healthMedicinesDue: 'ਦਵਾਈਆਂ ਬਾਕੀ',
    // Time references
    timeTomorrow: 'ਕੱਲ',
    timePending: 'ਲੰਬਿਤ',
    // Doctor information
    doctorsTopDoctors: 'ਪ੍ਰਮੁੱਖ ਡਾਕਟਰ',
    doctorsSeeAll: 'ਸਾਰੇ ਦੇਖੋ',
    doctorsSession: 'ਸੈਸ਼ਨ',
    doctorsFreeConsultation: 'ਮੁਫਤ ਸਲਾਹ',
    // Medical specialties
    specialtyCardiologist: 'ਕਾਰਡੀਓਲੋਜਿਸਟ',
    specialtyNeurologist: 'ਨਿਊਰੋਲੋਜਿਸਟ',
    specialtyDermatologist: 'ਡਰਮੇਟੋਲੋਜਿਸਟ',
    specialtyGeneralMedicine: 'ਜਨਰਲ ਮੈਡੀਸਨ',
    // Status indicators
    statusNormal: 'ਸਧਾਰਨ',
    statusUpcoming: 'ਆਉਣ ਵਾਲਾ',
    statusWarning: 'ਚੇਤਾਵਨੀ',
    statusAvailable: 'ਉਪਲਬਧ',
    statusMinAway: 'ਮਿੰਟ ਦੂਰ',
  },
};

// Custom context interface
interface LocalizationContextValue {
  currentLanguage: AppLanguage;
  changeLanguage: (lang: AppLanguage) => void;
  getText: (key: string) => string;
  getLanguageInfo: (lang: AppLanguage) => LanguageConfig;
  cycleLanguage: () => void;
}

// Custom context creation
const LocalizationContext = createContext<LocalizationContextValue | undefined>(undefined);

// Custom provider component
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<AppLanguage>('en');

  // Custom text retrieval function
  const getText = useCallback((key: string): string => {
    const translations = appTranslations[currentLanguage];
    return translations[key] || key;
  }, [currentLanguage]);

  // Custom language change function
  const changeLanguage = useCallback((lang: AppLanguage) => {
    setCurrentLanguage(lang);
  }, []);

  // Custom language info retrieval
  const getLanguageInfo = useCallback((lang: AppLanguage): LanguageConfig => {
    return languageConfigs[lang];
  }, []);

  // Custom language cycling
  const cycleLanguage = useCallback(() => {
    setCurrentLanguage(prev => {
      const languages: AppLanguage[] = ['en', 'hi', 'pa'];
      const currentIndex = languages.indexOf(prev);
      const nextIndex = (currentIndex + 1) % languages.length;
      return languages[nextIndex];
    });
  }, []);

  // Memoized context value
  const contextValue = useMemo<LocalizationContextValue>(() => ({
    currentLanguage,
    changeLanguage,
    getText,
    getLanguageInfo,
    cycleLanguage,
  }), [currentLanguage, changeLanguage, getText, getLanguageInfo, cycleLanguage]);

  return (
    <LocalizationContext.Provider value={contextValue}>
      {children}
    </LocalizationContext.Provider>
  );
}

// Custom hook for accessing localization
export function useI18n(): LocalizationContextValue {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

// Custom language name getter
export function getLanguageDisplayName(lang: AppLanguage, displayLang: AppLanguage): string {
  const config = languageConfigs[lang];
  return displayLang === 'en' ? config.name : config.nativeName;
}

// Export types for external use
export type { AppLanguage, LanguageConfig, TranslationMap };