/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        erum: {
          main: '#2FAB84',
          secondary: '#1F715F',
          primary: '#75CF91',
        },
        state: {
          gold: '#C9A65F',
          silver: '#969494',
          error: '#EF5350',
          success: '#67B773',
          orange: '#FF664F',
          sky: '#A1D7F4',
        },
        neutral: {
          black1: '#1D1F1F',
          black2: '#4B5057',
          black3: '#00000080',
          grey1: '#E5E8EC',
          grey2: '#F3F9F9',
          grey3: '#F1F1F1',
          disabled: '#B4B8BD',
          white: '#FFFFFF',
        },
      },
      fontFamily: {
        pretendard: ['Pretendard'],
      },
      fontSize: {
        'heading-1': ['1.4rem', { lineHeight: '150%', fontWeight: '600' }],
        'heading-2': ['1.3rem', { lineHeight: '150%', fontWeight: '600' }],
        'heading-3': ['1.2rem', { lineHeight: '150%', fontWeight: '600' }],
        'large-bold': ['1.1rem', { lineHeight: '150%', fontWeight: '600' }],
        'large-regular': ['1.1rem', { lineHeight: '150%', fontWeight: '400' }],
        'normal-bold': ['1rem', { lineHeight: '150%', fontWeight: '600' }],
        'normal-regular': ['1rem', { lineHeight: '150%', fontWeight: '400' }],
        'small-bold': ['.8rem', { lineHeight: '150%', fontWeight: '600' }],
        'small-regular': ['.8rem', { lineHeight: '150%', fontWeight: '400' }],
      },
    },
  },
  plugins: [],
}
