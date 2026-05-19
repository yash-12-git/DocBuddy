// ─── CSS Variable-based Theme System ────────────────────────────────
// All colors as CSS custom properties for runtime theming.
// To switch themes, override CSS vars on :root or a parent element.

export const cssVars = `
  :root {
    --color-primary: #0D9488;
    --color-primary-light: #14B8A6;
    --color-primary-dark: #0F766E;
    --color-primary-bg: #F0FDFA;
    --color-accent: #F59E0B;
    --color-accent-light: #FCD34D;
    --color-accent-dark: #D97706;
    --color-success: #10B981;
    --color-success-bg: #ECFDF5;
    --color-warning: #F59E0B;
    --color-warning-bg: #FFFBEB;
    --color-error: #EF4444;
    --color-error-bg: #FEF2F2;
    --color-info: #3B82F6;
    --color-info-bg: #EFF6FF;
    --color-text: #1E293B;
    --color-text-secondary: #64748B;
    --color-text-muted: #94A3B8;
    --color-border: #E2E8F0;
    --color-border-light: #F1F5F9;
    --color-bg: #FFFFFF;
    --color-bg-secondary: #F8FAFC;
    --color-bg-tertiary: #F1F5F9;
    --color-overlay: rgba(15, 23, 42, 0.5);
    --color-verified: #0D9488;
    --color-online: #10B981;
    --color-offline: #64748B;
    --color-star: #FBBF24;
    --font-heading: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-body: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
    --text-xs: 0.75rem;
    --text-sm: 0.8125rem;
    --text-base: 0.9375rem;
    --text-md: 1rem;
    --text-lg: 1.125rem;
    --text-xl: 1.25rem;
    --text-2xl: 1.5rem;
    --text-3xl: 1.875rem;
    --text-4xl: 2.25rem;
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 0.75rem;
    --space-base: 1rem;
    --space-lg: 1.5rem;
    --space-xl: 2rem;
    --space-2xl: 3rem;
    --space-3xl: 4rem;
    --radius-sm: 6px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;
    --radius-full: 9999px;
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
    --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05);
    --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04);
    --shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05);
    --shadow-card: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    --shadow-card-hover: 0 10px 20px rgba(0,0,0,0.08), 0 3px 6px rgba(0,0,0,0.05);
    --transition-fast: 150ms ease;
    --transition-base: 200ms ease;
    --transition-slow: 300ms ease;
  }
`;

// JS-accessible theme — references CSS vars so Emotion styles stay themeable
export const theme = {
  colors: {
    primary: 'var(--color-primary)',
    primaryLight: 'var(--color-primary-light)',
    primaryDark: 'var(--color-primary-dark)',
    primaryBg: 'var(--color-primary-bg)',
    accent: 'var(--color-accent)',
    accentLight: 'var(--color-accent-light)',
    accentDark: 'var(--color-accent-dark)',
    success: 'var(--color-success)',
    successBg: 'var(--color-success-bg)',
    warning: 'var(--color-warning)',
    warningBg: 'var(--color-warning-bg)',
    error: 'var(--color-error)',
    errorBg: 'var(--color-error-bg)',
    info: 'var(--color-info)',
    infoBg: 'var(--color-info-bg)',
    text: 'var(--color-text)',
    textSecondary: 'var(--color-text-secondary)',
    textMuted: 'var(--color-text-muted)',
    border: 'var(--color-border)',
    borderLight: 'var(--color-border-light)',
    bg: 'var(--color-bg)',
    bgSecondary: 'var(--color-bg-secondary)',
    bgTertiary: 'var(--color-bg-tertiary)',
    overlay: 'var(--color-overlay)',
    verified: 'var(--color-verified)',
    online: 'var(--color-online)',
    offline: 'var(--color-offline)',
    star: 'var(--color-star)',
  },
  fonts: {
    heading: 'var(--font-heading)',
    body: 'var(--font-body)',
    mono: 'var(--font-mono)',
  },
  fontSizes: {
    xs: 'var(--text-xs)',
    sm: 'var(--text-sm)',
    base: 'var(--text-base)',
    md: 'var(--text-md)',
    lg: 'var(--text-lg)',
    xl: 'var(--text-xl)',
    '2xl': 'var(--text-2xl)',
    '3xl': 'var(--text-3xl)',
    '4xl': 'var(--text-4xl)',
  },
  spacing: {
    xs: 'var(--space-xs)',
    sm: 'var(--space-sm)',
    md: 'var(--space-md)',
    base: 'var(--space-base)',
    lg: 'var(--space-lg)',
    xl: 'var(--space-xl)',
    '2xl': 'var(--space-2xl)',
    '3xl': 'var(--space-3xl)',
  },
  radii: {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
    full: 'var(--radius-full)',
  },
  shadows: {
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    xl: 'var(--shadow-xl)',
    card: 'var(--shadow-card)',
    cardHover: 'var(--shadow-card-hover)',
  },
  transitions: {
    fast: 'var(--transition-fast)',
    base: 'var(--transition-base)',
    slow: 'var(--transition-slow)',
  },
} as const;

export type Theme = typeof theme;
