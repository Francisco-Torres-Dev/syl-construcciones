/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        graphite: '#202328',
        ink: '#141619',
        mist: '#F4F5F6',
        steel: '#858A91',
        brand: { DEFAULT: '#F28C28', dark: '#D96D13' },
      },
      fontFamily: {
        display: ['"Manrope Variable"', 'system-ui', 'sans-serif'],
        sans: ['"Inter Variable"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
