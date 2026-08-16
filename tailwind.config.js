/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core palette — monochrome KEKAL brand
        'kk-black':   '#000000',
        'kk-white':   '#FFFFFF',
        'kk-gray-50':  '#FAFAFA',
        'kk-gray-100': '#F5F5F5',
        'kk-gray-200': '#E5E5E5',
        'kk-gray-300': '#D4D4D4',
        'kk-gray-400': '#A3A3A3',
        'kk-gray-500': '#737373',
        'kk-gray-600': '#525252',
        'kk-gray-700': '#404040',
        'kk-gray-800': '#262626',
        'kk-gray-900': '#171717',
        // Accent — placeholder; overridden via brand settings
        'kk-accent':   'var(--kk-accent, #000000)',
      },
      fontFamily: {
        // Display: high-contrast editorial serif
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        // Body: clean geometric sans
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        // Utility: tabular mono for data/labels
        mono: ['"DM Mono"', 'monospace'],
      },
      spacing: {
        // Extended spacing scale for generous whitespace
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      letterSpacing: {
        'widest-2': '0.2em',
      },
    },
  },
  plugins: [],
}
