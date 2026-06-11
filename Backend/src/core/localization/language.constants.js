/**
 * Supported languages and their structural properties for localization templates and UI.
 */
export const LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    rtl: false,
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    rtl: false,
  },
  mr: {
    code: 'mr',
    name: 'Marathi',
    rtl: false,
  },
  gu: {
    code: 'gu',
    name: 'Gujarati',
    rtl: false,
  },
  kn: {
    code: 'kn',
    name: 'Kannada',
    rtl: false,
  },
  ta: {
    code: 'ta',
    name: 'Tamil',
    rtl: false,
  },
  te: {
    code: 'te',
    name: 'Telugu',
    rtl: false,
  },
  ml: {
    code: 'ml',
    name: 'Malayalam',
    rtl: false,
  },
};

export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGES);
export const DEFAULT_LANGUAGE = LANGUAGES.en.code;
