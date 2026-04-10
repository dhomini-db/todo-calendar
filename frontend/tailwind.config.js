/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sidebar: '#191919',
        surface: '#242424',
        card: '#2c2c2c',
        border: '#3a3a3a',
        accent: '#7c5cfc',
      },
    },
  },
  plugins: [],
}
