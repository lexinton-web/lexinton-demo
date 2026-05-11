import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Legacy (keep for backward compat with Footer etc.)
        'lx-red':    '#C41230',
        'lx-dark':   '#1a1a1a',
        'lx-mid':    '#4a4a4a',
        'lx-light':  '#f5f5f3',
        'lx-white':  '#ffffff',
        'lx-border': '#e5e5e5',
        // Premium palette
        'lx-ink':    '#111111',
        'lx-stone':  '#6e6e6e',
        'lx-cream':  '#ffffff',
        'lx-parchment': '#f5f5f5',
        'lx-accent': '#3d5a6c',   // blue-grey petróleo
        'lx-line':   '#e5e5e5',
        // Light-mode surface tokens (Samsung-inspired)
        'lx-surface':   '#ffffff',
        'lx-surface-2': '#f5f5f5',
        'lx-surface-3': '#ebebeb',
        'lx-text':      '#111111',
        'lx-text-2':    '#555555',
        'lx-text-3':    '#666666',
      },
      fontFamily: {
        sans:  ['var(--font-inter)',   'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)',   'Georgia',   'serif'],
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      letterSpacing: {
        eyebrow: '0.14em',
        wide2: '0.20em',
      },
      animation: {
        'fade-up': 'fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
