import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types/concept';
import { TRANSLATIONS, TranslationKey } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'pt',
  setLanguage: () => {},
  t: (key) => TRANSLATIONS.pt[key] || key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('de_ai_language');
      return saved === 'en' ? 'en' : 'pt'; // Defaults to Portuguese Brasil!
    } catch {
      return 'pt';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('de_ai_language', lang);
    } catch (e) {
      console.error(e);
    }
  };

  const t = (key: TranslationKey): string => {
    return TRANSLATIONS[language][key] || TRANSLATIONS.pt[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
