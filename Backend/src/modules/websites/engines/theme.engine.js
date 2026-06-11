import { DEFAULT_THEME_CODE, THEME_TYPES } from '../constants/themeTypes.js';

export const THEME_REGISTRY = {
  [THEME_TYPES.LUXURY]: {
    code: THEME_TYPES.LUXURY,
    name: 'Luxury',
    colors: {
      primary: '#735c00',
      secondary: '#5f5e5e',
      background: '#fbf9f9',
      surface: '#ffffff',
      accent: '#d4af37',
    },
    fonts: {
      heading: 'Bodoni Moda',
      body: 'Hanken Grotesk',
    },
    spacing: {
      section: '64px',
      container: '1200px',
    },
    buttons: {
      radius: '12px',
      weight: '700',
    },
    cards: {
      radius: '8px',
      border: '1px solid rgba(127,118,99,0.25)',
    },
  },
  [THEME_TYPES.MINIMAL]: {
    code: THEME_TYPES.MINIMAL,
    name: 'Minimal',
    colors: {
      primary: '#1b1c1c',
      secondary: '#6b7280',
      background: '#ffffff',
      surface: '#f8fafc',
      accent: '#111827',
    },
    fonts: {
      heading: 'Hanken Grotesk',
      body: 'Hanken Grotesk',
    },
    spacing: {
      section: '56px',
      container: '1120px',
    },
    buttons: {
      radius: '8px',
      weight: '700',
    },
    cards: {
      radius: '8px',
      border: '1px solid #e5e7eb',
    },
  },
  [THEME_TYPES.BEAUTY]: {
    code: THEME_TYPES.BEAUTY,
    name: 'Beauty',
    colors: {
      primary: '#9d174d',
      secondary: '#6b7280',
      background: '#fff7fb',
      surface: '#ffffff',
      accent: '#f9a8d4',
    },
    fonts: {
      heading: 'Bodoni Moda',
      body: 'Hanken Grotesk',
    },
    spacing: {
      section: '64px',
      container: '1180px',
    },
    buttons: {
      radius: '999px',
      weight: '700',
    },
    cards: {
      radius: '8px',
      border: '1px solid #fbcfe8',
    },
  },
  [THEME_TYPES.BARBER]: {
    code: THEME_TYPES.BARBER,
    name: 'Barber',
    colors: {
      primary: '#111827',
      secondary: '#9ca3af',
      background: '#f9fafb',
      surface: '#ffffff',
      accent: '#b45309',
    },
    fonts: {
      heading: 'Hanken Grotesk',
      body: 'Hanken Grotesk',
    },
    spacing: {
      section: '60px',
      container: '1180px',
    },
    buttons: {
      radius: '6px',
      weight: '800',
    },
    cards: {
      radius: '6px',
      border: '1px solid #d1d5db',
    },
  },
  [THEME_TYPES.SPA]: {
    code: THEME_TYPES.SPA,
    name: 'Spa',
    colors: {
      primary: '#166534',
      secondary: '#64748b',
      background: '#f7fbf7',
      surface: '#ffffff',
      accent: '#86efac',
    },
    fonts: {
      heading: 'Bodoni Moda',
      body: 'Hanken Grotesk',
    },
    spacing: {
      section: '72px',
      container: '1160px',
    },
    buttons: {
      radius: '999px',
      weight: '700',
    },
    cards: {
      radius: '8px',
      border: '1px solid #bbf7d0',
    },
  },
};

export function resolveTheme(themeCode = DEFAULT_THEME_CODE) {
  return THEME_REGISTRY[themeCode] || THEME_REGISTRY[DEFAULT_THEME_CODE];
}

export function listThemes() {
  return Object.values(THEME_REGISTRY);
}
