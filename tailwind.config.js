/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: 'var(--color-bg)',
          2: 'var(--color-bg-2)',
          3: 'var(--color-bg-3)',
          4: 'var(--color-bg-4)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          2: 'var(--color-border-2)',
        },
        accent: {
          DEFAULT: '#26a17b',
          dark:    '#1d8a65',
          glow:    'rgba(38,161,123,0.15)',
        },
        content: {
          DEFAULT: 'var(--color-content)',
          2: 'var(--color-content-2)',
          3: 'var(--color-content-3)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
