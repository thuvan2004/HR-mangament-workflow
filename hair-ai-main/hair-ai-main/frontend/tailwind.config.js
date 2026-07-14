/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces — cooler, near-black, less blue-purple murk than before
        'dark-bg': '#090B10',
        'dark-card': '#12141C',
        'dark-border': '#262B3A',

        // Brand accents — sharpened, more instrument-grade than "generic AI gradient"
        'brand-violet': '#6D5DF6',
        'brand-cyan': '#00C2D1',
        'brand-emerald': '#17C978',
        'brand-amber': '#F5A623',
        'brand-rose': '#FF4D6A',
      },
      fontFamily: {
        // Display: technical/geometric — used sparingly for wordmark + hero
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        // Body: default
        sans: ['Inter', 'system-ui', 'sans-serif'],
        // Data/readout font — reinforces the "diagnostic instrument" feel for scores
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'instrument': '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 40px -20px rgba(0,0,0,0.6)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'pulse-scan': {
          '0%': { top: '0%', opacity: 0 },
          '10%': { opacity: 1 },
          '90%': { opacity: 1 },
          '100%': { top: '100%', opacity: 0 },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-scan': 'pulse-scan 2.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
