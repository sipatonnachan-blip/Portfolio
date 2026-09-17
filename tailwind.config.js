/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        text: {
          DEFAULT: 'var(--text)',
          mid: 'var(--text-mid)',
          light: 'var(--text-light)',
        },
        border: 'var(--border)',
        bg: {
          DEFAULT: 'var(--bg)',
          card: 'var(--bg-card)',
          alt: 'var(--bg-alt)',
        },
        highlight: {
          border: 'var(--highlight-border)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"Helvetica Neue"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
      },
      backgroundImage: {
        highlight: 'var(--highlight-bg)',
      },
      transitionDuration: {
        DEFAULT: '250ms',
        250: '250ms',
      },
      keyframes: {
        'pulse-green': {
          '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.7)' },
          '70%': { transform: 'scale(1)', boxShadow: '0 0 0 6px rgba(16, 185, 129, 0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'menu-open': {
          '0%': { opacity: '0', transform: 'translateY(-6px)', maxHeight: '0' },
          '100%': { opacity: '1', transform: 'translateY(0)', maxHeight: '600px' },
        },
      },
      animation: {
        'pulse-green': 'pulse-green 2s infinite',
        'fade-in-up': 'fade-in-up 0.45s ease-out both',
        'fade-in': 'fade-in 0.3s ease-out both',
        'menu-open': 'menu-open 0.3s ease-out both',
      },
    },
  },
  plugins: [],
}
