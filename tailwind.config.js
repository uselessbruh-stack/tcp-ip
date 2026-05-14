/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#0b0f14',
          100: '#0f1419',
          200: '#141a22',
          300: '#1a222d',
          400: '#212b38',
        },
        accent: {
          cyan: '#22d3ee',
          blue: '#3b82f6',
          green: '#10b981',
          red: '#ef4444',
          orange: '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 15px rgba(34,211,238,0.15)',
        'glow-lg': '0 0 30px rgba(34,211,238,0.2)',
        'glow-green': '0 0 15px rgba(16,185,129,0.2)',
        'glow-red': '0 0 15px rgba(239,68,68,0.2)',
      },
    },
  },
  plugins: [],
}
