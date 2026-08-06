/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
        },
        surface: {
          light: '#ffffff',
          dark: '#0f1115',
        },
        panel: {
          light: '#ffffff',
          dark: '#1a1d24',
        },
        border: {
          light: '#f1f5f9',
          dark: '#2a2d36',
        },
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}