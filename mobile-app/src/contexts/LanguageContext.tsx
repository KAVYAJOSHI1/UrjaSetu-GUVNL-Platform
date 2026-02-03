import React, { createContext, ReactNode, useContext } from 'react';
import { useTranslation } from 'react-i18next';


interface LanguageContextType {
  language: string;
  changeLanguage: (lang: string) => void;
  cycleLanguage: () => void;
  t: (key: string, options?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { t, i18n: i18nInstance } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18nInstance.changeLanguage(lang);
  };

  const cycleLanguage = () => {
    const current = i18nInstance.language;
    const order = ['en', 'hi', 'gu'];
    const nextIndex = (order.indexOf(current) + 1) % order.length;
    changeLanguage(order[nextIndex]);
  };

  return (
    <LanguageContext.Provider value={{ language: i18nInstance.language, changeLanguage, cycleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
