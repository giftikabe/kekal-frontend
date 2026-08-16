/**
 * Kekal Living — Design Tokens
 *
 * Brand: monochrome "KK" interlocking logomark. True black + white core, neutral
 * gray scale for surfaces and borders. One accent token left as a runtime CSS var
 * so the admin can override it via brand settings without a redeploy.
 *
 * Import these tokens in TypeScript (for logic/props); the same values are also
 * exposed as CSS custom properties in src/index.css so non-TS contexts (plain CSS,
 * CSS Modules) can consume them via var(--kk-*).
 */

// ─── Color ────────────────────────────────────────────────────────────────────

export const colors = {
  black:    '#000000',
  white:    '#FFFFFF',

  // Neutral gray scale — surfaces, borders, muted text
  gray: {
    50:  '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  /**
   * Accent — intentionally left as a runtime CSS variable so the admin can
   * override it via brand settings (PATCH /api/brand). The JS fallback is black
   * so the UI is always legible before a value is fetched.
   *
   * Usage in CSS:   color: var(--kk-accent);
   * Usage in JS:    style={{ color: 'var(--kk-accent)' }}
   */
  accent: 'var(--kk-accent, #000000)',
} as const

// ─── Typography ───────────────────────────────────────────────────────────────

export const fonts = {
  /**
   * Display — Playfair Display
   * Used for headlines, hero text, editorial moments. High-contrast thick/thin
   * strokes that echo the KEKAL logomark's geometric weight play.
   */
  display: '"Playfair Display", Georgia, serif',

  /**
   * Sans — DM Sans
   * UI text, body copy, navigation, labels. Optically neutral; pairs cleanly
   * with Playfair without competing.
   */
  sans: '"DM Sans", system-ui, sans-serif',

  /**
   * Mono — DM Mono
   * Prices, order numbers, SKUs, admin data tables. Tabular numerals by default.
   */
  mono: '"DM Mono", monospace',
} as const

export const fontWeights = {
  regular:   400,
  medium:    500,
  semibold:  600,
  bold:      700,
  black:     900,
} as const

/** Type scale — rem values keyed by semantic role */
export const typeSizes = {
  xs:   '0.75rem',   // 12px — captions, badges
  sm:   '0.875rem',  // 14px — labels, secondary text
  base: '1rem',      // 16px — body copy
  lg:   '1.125rem',  // 18px — lead text
  xl:   '1.25rem',   // 20px — section subheadings
  '2xl': '1.5rem',   // 24px — card titles, minor headings
  '3xl': '1.875rem', // 30px — page headings
  '4xl': '2.25rem',  // 36px — section heroes
  '5xl': '3rem',     // 48px — large hero text
  '6xl': '3.75rem',  // 60px — max display size
} as const

export const lineHeights = {
  tight:   1.15,
  snug:    1.35,
  normal:  1.5,
  relaxed: 1.7,
} as const

export const letterSpacings = {
  tight:    '-0.02em',
  normal:   '0em',
  wide:     '0.08em',
  widest:   '0.15em',
  'widest-2': '0.20em', // All-caps labels, eyebrows
} as const

// ─── Spacing ──────────────────────────────────────────────────────────────────

/**
 * Spacing scale — 4 px base unit.
 * Keyed by token name for TS usage; Tailwind config mirrors these.
 */
export const spacing = {
  0:    '0px',
  1:    '0.25rem',  // 4px
  2:    '0.5rem',   // 8px
  3:    '0.75rem',  // 12px
  4:    '1rem',     // 16px
  5:    '1.25rem',  // 20px
  6:    '1.5rem',   // 24px
  8:    '2rem',     // 32px
  10:   '2.5rem',   // 40px
  12:   '3rem',     // 48px
  16:   '4rem',     // 64px
  20:   '5rem',     // 80px
  24:   '6rem',     // 96px
  32:   '8rem',     // 128px
  40:   '10rem',    // 160px
  48:   '12rem',    // 192px
} as const

// ─── Border ───────────────────────────────────────────────────────────────────

export const borderRadius = {
  none: '0px',
  sm:   '2px',
  base: '4px',
  md:   '6px',
  lg:   '8px',
  xl:   '12px',
  full: '9999px',
} as const

export const borderWidths = {
  hairline: '0.5px',
  thin:     '1px',
  base:     '1.5px',
  thick:    '2px',
} as const

// ─── Shadows ──────────────────────────────────────────────────────────────────

export const shadows = {
  none:  'none',
  sm:    '0 1px 2px 0 rgba(0,0,0,0.08)',
  base:  '0 2px 8px 0 rgba(0,0,0,0.10)',
  md:    '0 4px 16px 0 rgba(0,0,0,0.12)',
  lg:    '0 8px 32px 0 rgba(0,0,0,0.16)',
  xl:    '0 16px 48px 0 rgba(0,0,0,0.20)',
} as const

// ─── Transitions ──────────────────────────────────────────────────────────────

export const transitions = {
  fast:   '100ms ease',
  base:   '200ms ease',
  slow:   '350ms ease',
  slower: '500ms ease',
} as const

// ─── Breakpoints ──────────────────────────────────────────────────────────────

export const breakpoints = {
  sm:  '640px',
  md:  '768px',
  lg:  '1024px',
  xl:  '1280px',
  '2xl': '1536px',
} as const

// ─── Z-index ──────────────────────────────────────────────────────────────────

export const zIndex = {
  base:    0,
  raised:  10,
  overlay: 100,
  modal:   200,
  toast:   300,
  tooltip: 400,
} as const
