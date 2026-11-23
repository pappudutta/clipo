/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#0a0c1b',
          800: '#11142a',
          700: '#1a1e3d',
          600: '#2a3066',
          500: '#3d4590',
        },
        arcade: {
          yellow: '#ffd23f',
          cyan: '#35f0e0',
          pink: '#ff4d8d',
          text: '#e9ecff',
          muted: '#8f97cf',
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'ui-monospace', 'monospace'],
        term: ['VT323', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        pixel: '4px 4px 0 0 #04050e',
        'pixel-sm': '2px 2px 0 0 #04050e',
        'pixel-yellow': '4px 4px 0 0 #9a7600',
        'pixel-cyan': '4px 4px 0 0 #0c7a72',
      },
    },
  },
  plugins: [],
};
