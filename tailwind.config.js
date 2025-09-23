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
        primary: {
          DEFAULT: 'var(--color-primary)',
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          500: 'var(--color-primary-500)',
          700: 'var(--color-primary-700)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          100: 'var(--color-secondary-100)',
          500: 'var(--color-secondary-500)',
        },
        accent: 'var(--color-accent)',
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        border: 'var(--color-border)',
        'border-focus': 'var(--color-border-focus)',
      },
      fontFamily: {
        heading: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'elevation-1': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'elevation-2': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'elevation-3': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      zIndex: {
        'dropdown': '50',
        'header': '40',
        'mobile-menu': '45',
      },
      animation: {
        'micro-interaction': 'transform 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}