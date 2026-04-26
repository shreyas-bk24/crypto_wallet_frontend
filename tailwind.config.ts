import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './providers/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'sans-serif'],
        mono: ['var(--font-ibm-plex-mono)', 'monospace']
      },
      colors: {
        ink: {
          950: '#050816',
          900: '#0a1022',
          850: '#101833',
          800: '#17213d'
        },
        accent: {
          400: '#7dd3fc',
          500: '#38bdf8',
          600: '#0ea5e9'
        }
      },
      boxShadow: {
        glow: '0 20px 80px rgba(14, 165, 233, 0.16)',
        card: '0 18px 50px rgba(3, 8, 24, 0.45)'
      },
      backgroundImage: {
        'radial-grid': 'radial-gradient(circle at top, rgba(56, 189, 248, 0.18), transparent 40%), linear-gradient(180deg, rgba(3, 7, 18, 0.92), rgba(5, 8, 22, 0.98))'
      }
    }
  },
  plugins: []
};

export default config;