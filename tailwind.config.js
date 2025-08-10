/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ecff',
          200: '#b9deff',
          300: '#89c8ff',
          400: '#56acff',
          500: '#2b8cff',
          600: '#0c6cf4',
          700: '#0656d1',
          800: '#0846a6',
          900: '#0d3d82'
        }
      }
    }
  },
  plugins: []
};
