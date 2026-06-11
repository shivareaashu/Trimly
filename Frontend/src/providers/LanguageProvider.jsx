'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import enDictionary from '../locales/en/index.js';

const LanguageContext = createContext({
  currentLanguage: 'en',
  t: (key, variables) => key,
  changeLanguage: () => {},
});

/**
 * Root Language Provider Component.
 * Wraps the app to deliver dynamic, lazy-loaded translation capabilities.
 */
export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [dictionary, setDictionary] = useState(enDictionary);

  // Load saved language preference on startup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('trimly_lang');
      if (savedLang && savedLang !== 'en') {
        loadLanguage(savedLang);
      }
    }
  }, []);

  /**
   * Dynamically loads language segments at runtime.
   */
  const loadLanguage = async (langCode) => {
    try {
      // Lazy load language chunk index
      const module = await import(`../locales/${langCode}/index.js`);
      const selectedDict = module.default || {};
      
      // Merge translations: requested language overrides, falling back directly to English
      setDictionary({
        ...enDictionary,
        ...selectedDict,
      });
      setCurrentLanguage(langCode);
    } catch (err) {
      console.warn(
        `[Language Loader Alert] Failed to load translations for "${langCode}". Falling back directly to English.`,
        err.message
      );
      setDictionary(enDictionary);
      setCurrentLanguage('en');
    }
  };

  /**
   * Switch the active language and save selection.
   */
  const changeLanguage = async (langCode) => {
    if (langCode === 'en') {
      setDictionary(enDictionary);
      setCurrentLanguage('en');
      if (typeof window !== 'undefined') {
        localStorage.setItem('trimly_lang', 'en');
      }
    } else {
      await loadLanguage(langCode);
      if (typeof window !== 'undefined') {
        localStorage.setItem('trimly_lang', langCode);
      }
    }
  };

  /**
   * Scans and returns translated value with variable interpolation.
   */
  const t = (key, variables = {}) => {
    let value = dictionary[key];
    
    // Fallback warnings
    if (value === undefined) {
      console.warn(`[Missing Translation] Key: "${key}", Language: "${currentLanguage}"`);
      value = enDictionary[key] || key;
    }

    // Format tokens: {hours} -> variables.hours
    let message = value;
    Object.entries(variables).forEach(([k, val]) => {
      const placeholder = `{${k}}`;
      message = message.replaceAll(placeholder, val !== undefined && val !== null ? String(val) : '');
    });

    return message;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export default LanguageContext;
