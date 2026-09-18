import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ur';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Subject names
    'subject.urdu': 'Urdu',
    'subject.islamiyat': 'Islamiyat',
    'subject.pakistan_studies': 'Pakistan Studies',
    // Common UI
    'common.start_learning': 'Start Learning',
    'common.continue': 'Continue',
    'common.lessons': 'Lessons',
    'common.quizzes': 'Quizzes',
    'common.progress': 'Progress',
    'common.complete': 'Complete',
    // Descriptions
    'desc.urdu': 'Master Urdu language, literature, and composition',
    'desc.islamiyat': 'Learn Islamic history, teachings, and values',
    'desc.pakistan_studies': 'Explore Pakistan\'s history, geography, and culture',
  },
  ur: {
    // Subject names in Urdu
    'subject.urdu': 'اردو',
    'subject.islamiyat': 'اسلامیات',
    'subject.pakistan_studies': 'مطالعہ پاکستان',
    // Common UI in Urdu
    'common.start_learning': 'سیکھنا شروع کریں',
    'common.continue': 'جاری رکھیں',
    'common.lessons': 'اسباق',
    'common.quizzes': 'کوئز',
    'common.progress': 'پیش رفت',
    'common.complete': 'مکمل',
    // Descriptions in Urdu
    'desc.urdu': 'اردو زبان، ادب اور تحریر میں مہارت حاصل کریں',
    'desc.islamiyat': 'اسلامی تاریخ، تعلیمات اور اقدار سیکھیں',
    'desc.pakistan_studies': 'پاکستان کی تاریخ، جغرافیہ اور ثقافت کا جائزہ لیں',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
