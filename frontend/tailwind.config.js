/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6', // Purple/Violet
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        accent: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981', // Emerald green for success
          600: '#059669',
        },
        darkBg: '#0b0f19', // Premium dark navy
        darkCard: '#151b2c', // Sleek dark slate/blue card
        darkBorder: '#1f293d',
        'brutal-red': '#E84A43',
        'brutal-yellow': '#EBF300',
        'brutal-charcoal': '#111111',
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'brutal-sm': '2px 2px 0px 0px rgba(17, 17, 17, 1)',
        'brutal-md': '4px 4px 0px 0px rgba(17, 17, 17, 1)',
        'brutal-lg': '8px 8px 0px 0px rgba(17, 17, 17, 1)',
        'brutal-dark-sm': '2px 2px 0px 0px rgba(255, 255, 255, 1)',
        'brutal-dark-md': '4px 4px 0px 0px rgba(255, 255, 255, 1)',
        'brutal-dark-lg': '8px 8px 0px 0px rgba(255, 255, 255, 1)',
      }
    },
  },
  plugins: [],
}
