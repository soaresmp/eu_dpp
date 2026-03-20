/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        eu: {
          blue: '#003399',
          gold: '#FFCC00',
          dark: '#1a1a2e',
        }
      }
    }
  },
  plugins: [],
};
