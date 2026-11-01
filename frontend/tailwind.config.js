/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: '#0B0F19',
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
          500: '#64748B',
          400: '#94A3B8',
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9',
          50: '#F8FAFC',
        },
        cream: {
          50: '#FFFFFF',
          100: 'var(--bg-cream-surface, #FFF5F6)',
          200: 'var(--border-card-subtle, #FCE8EB)',
          300: 'var(--border-card, #F2D0D6)',
          400: '#CBD5E1',
          500: '#94A3B8',
        },
        gold: {
          50: '#FDF9EC',
          100: '#F9F1D1',
          200: '#F1E0A0',
          300: '#E8CB69',
          400: '#DCB231',
          500: '#C5951A',
          600: '#A47712',
          700: '#7F5A0D',
        },
        burgundy: {
          50: '#FDF2F4',
          100: '#F9DDE2',
          200: '#F2B5C1',
          300: '#E48194',
          400: '#B83B52',
          500: '#800020',
          600: '#69001A',
          700: '#520014',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
