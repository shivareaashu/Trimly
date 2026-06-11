'use client';

/**
 * Booking Theme Engine
 * 
 * Resolves theme tokens from tenant config (website themeCode or overrides).
 * The booking wizard inherits appearance from the Website Builder theme system.
 * 
 * Usage:
 *   const theme = resolveBookingTheme(tenantConfig);
 *   <div style={themeToCSS(theme)}>...</div>
 */

export const THEME_PRESETS = {
  luxury: {
    bg: '#0B0B0F',
    surface: '#111116',
    surface2: '#1a1a22',
    surface3: '#222230',
    accent: '#D4AF37',
    accentSoft: 'rgba(212, 175, 55, 0.12)',
    accentGlow: 'rgba(212, 175, 55, 0.25)',
    text: '#FBF9F9',
    muted: '#888898',
    border: 'rgba(255,255,255,0.06)',
    borderHover: 'rgba(255,255,255,0.12)',
    success: '#22C55E',
    accentGradientEnd: '#c9a033',
  },
  beauty: {
    bg: '#140a12',
    surface: '#1c1018',
    surface2: '#251520',
    surface3: '#2e1a28',
    accent: '#E8A0BF',
    accentSoft: 'rgba(232, 160, 191, 0.12)',
    accentGlow: 'rgba(232, 160, 191, 0.25)',
    text: '#FFF5F9',
    muted: '#998890',
    border: 'rgba(255,255,255,0.06)',
    borderHover: 'rgba(255,255,255,0.12)',
    success: '#22C55E',
    accentGradientEnd: '#d48aa8',
  },
  barber: {
    bg: '#0e0e0e',
    surface: '#161616',
    surface2: '#1e1e1e',
    surface3: '#282828',
    accent: '#C0C0C0',
    accentSoft: 'rgba(192, 192, 192, 0.10)',
    accentGlow: 'rgba(192, 192, 192, 0.20)',
    text: '#F0F0F0',
    muted: '#808080',
    border: 'rgba(255,255,255,0.06)',
    borderHover: 'rgba(255,255,255,0.14)',
    success: '#22C55E',
    accentGradientEnd: '#a0a0a0',
  },
  spa: {
    bg: '#0a120e',
    surface: '#0f1a14',
    surface2: '#152218',
    surface3: '#1c2c22',
    accent: '#7EC8A0',
    accentSoft: 'rgba(126, 200, 160, 0.10)',
    accentGlow: 'rgba(126, 200, 160, 0.20)',
    text: '#F0FFF5',
    muted: '#7a9a88',
    border: 'rgba(255,255,255,0.05)',
    borderHover: 'rgba(255,255,255,0.10)',
    success: '#22C55E',
    accentGradientEnd: '#5fb888',
  },
  minimal: {
    bg: '#FFFFFF',
    surface: '#F8F8FA',
    surface2: '#F0F0F4',
    surface3: '#E8E8EE',
    accent: '#1A1A2E',
    accentSoft: 'rgba(26, 26, 46, 0.06)',
    accentGlow: 'rgba(26, 26, 46, 0.12)',
    text: '#1A1A2E',
    muted: '#888898',
    border: 'rgba(0,0,0,0.08)',
    borderHover: 'rgba(0,0,0,0.14)',
    success: '#22C55E',
    accentGradientEnd: '#333358',
  },
};

/**
 * Resolve a booking theme from tenant config.
 * Falls back to luxury preset.
 * 
 * @param {Object|null} tenantConfig 
 * @returns {Object} Theme tokens
 */
export function resolveBookingTheme(tenantConfig) {
  const code = tenantConfig?.themeCode || 'luxury';
  const preset = THEME_PRESETS[code] || THEME_PRESETS.luxury;

  // Allow tenant-level overrides (from website builder custom colors)
  const overrides = tenantConfig?.themeOverrides || {};
  return { ...preset, ...overrides };
}

/**
 * Convert theme tokens into CSS custom property style object.
 * Apply to the .bk-container element.
 * 
 * @param {Object} theme
 * @returns {Object} React style object
 */
export function themeToCSS(theme) {
  return {
    '--bk-charcoal': theme.bg,
    '--bk-surface': theme.surface,
    '--bk-surface-2': theme.surface2,
    '--bk-surface-3': theme.surface3,
    '--bk-gold': theme.accent,
    '--bk-gold-soft': theme.accentSoft,
    '--bk-gold-glow': theme.accentGlow,
    '--bk-ivory': theme.text,
    '--bk-muted': theme.muted,
    '--bk-border': theme.border,
    '--bk-border-hover': theme.borderHover,
    '--bk-success': theme.success,
  };
}

export default { resolveBookingTheme, themeToCSS, THEME_PRESETS };
