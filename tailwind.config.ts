import type { Config } from 'tailwindcss'

export default {
  theme: {
    extend: {
      colors: {
        leaf: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        soil: {
          500: '#a0522d',
          800: '#5D4037'
        }
      }
    }
  },
} satisfies Config
