import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../data/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    // Default to 'en' or read from localStorage, ensuring it exists in translations
    const [language, setLanguage] = useState(() => {
        const saved = localStorage.getItem('app_language');
        return (saved && translations[saved]) ? saved : 'en';
    });

    useEffect(() => {
        localStorage.setItem('app_language', language);
        // Toggle body class for language-specific styling
        if (language === 'ml') {
            document.body.classList.add('lang-ml');
        } else {
            document.body.classList.remove('lang-ml');
        }
    }, [language]);

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'ml' : 'en');
    };

    const t = (key) => {
        return translations[language]?.[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
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
