import React, { createContext, useState, useEffect } from 'react';

// Create the Language Context
export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    // Get initial language from localStorage or default to 'en'
    const getInitialLanguage = () => {
        const savedLanguage = localStorage.getItem('appLanguage');
        return savedLanguage || 'en';
    };

    const [language, setLanguage] = useState(getInitialLanguage);

    // Save language preference to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('appLanguage', language);
    }, [language]);

    const value = {
        language,
        setLanguage,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};