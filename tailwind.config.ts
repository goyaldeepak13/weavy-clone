import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#e9efff',
          200: '#cfd9ff',
          300: '#a9baff',
          400: '#7f94ff',
          500: '#5a72ff',
          600: '#3f55f5',
          700: '#2f41d1',
          800: '#2735a8',
          900: '#222f83',
        },
        dark: '#0b0f1a',
        muted: '#0f1526',
      },
      backgroundImage: {
        'radial-faint': 'radial-gradient(1000px 600px at 50% -100px, rgba(90,114,255,0.35), transparent 60%)',
        'grid': 'linear-gradient(to right, rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.06) 1px, transparent 1px)'
      },
      backgroundSize: {
        grid: '40px 40px'
      },
      boxShadow: {
        soft: '0 10px 40px -10px rgba(90,114,255,0.35)',
        card: '0 8px 30px -8px rgba(0,0,0,0.35)'
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem'
      }
    }
  },
  plugins: [],
}
export default config
