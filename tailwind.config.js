/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tradeos: {
          navy: '#0F2A1D',
          blue: '#059669',
          'blue-dark': '#047857',
          orange: '#F59E0B',
          bg: '#F4F9F6',
          surface: '#FFFFFF',
          border: '#D5E5DC',
          'text-primary': '#14281E',
          'text-secondary': '#5A7A68',
          success: '#15803D',
          warning: '#B45309',
          danger: '#B91C1C',
          info: '#0369A1',
        }
      },
      fontFamily: {
        heading: ['"Space Grotesk"', '"Bricolage Grotesque"', 'sans-serif'],
        sans: ['"Space Grotesk"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      }
    },
  },
  plugins: [],
}
