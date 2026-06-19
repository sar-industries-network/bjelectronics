import type { Config } from 'tailwindcss';
const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1677ff',
          red: '#ef233c',
          navy: '#07111f',
          ink: '#0b1220'
        }
      },
      boxShadow: {
        premium: '0 24px 80px rgba(15, 23, 42, 0.12)',
        glow: '0 0 0 1px rgba(22, 119, 255, 0.20), 0 18px 70px rgba(22, 119, 255, 0.18)'
      },
      borderRadius: {
        premium: '1.5rem'
      }
    }
  },
  plugins: []
};
export default config;
