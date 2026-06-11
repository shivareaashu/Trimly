'use client';

import { useLanguage } from '../providers/LanguageProvider.jsx';

/**
 * Custom React hook to translate labels and toggle active language.
 * 
 * @returns {Object} { t, changeLanguage, currentLanguage }
 */
export function useTranslation() {
  const { t, changeLanguage, currentLanguage } = useLanguage();
  return { t, changeLanguage, currentLanguage };
}

export default useTranslation;
