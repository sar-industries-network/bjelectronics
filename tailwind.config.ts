import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    screens: {
      xs: '380px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      '3xl': '1720px'
    },
    extend: {
      colors: {
        brand: {
          blue: '#2563eb',
          red: '#ef233c',
          navy: '#07111f',
          ink: '#0b1220',
          surface: '#f7f8fb',
          muted: '#667085'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif']
      },
      boxShadow: {
        premium: '0 24px 80px rgba(15, 23, 42, 0.12)',
        glow: '0 0 0 1px rgba(37, 99, 235, 0.18), 0 18px 70px rgba(37, 99, 235, 0.16)',
        soft: '0 14px 38px rgba(15, 23, 42, 0.08)'
      },
      borderRadius: {
        premium: '1.5rem',
        '2.5xl': '1.35rem'
      },
      spacing: {
        safe: 'env(safe-area-inset-bottom, 0px)'
      }
    }
  },
  plugins: []
};

export default config;
