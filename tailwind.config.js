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
          white: '#FFFFFF',
        },
      },
      fontFamily: {
        pretendard: ['Pretendard'],
      },
      fontSize: {
        'heading-1': ['36px', { lineHeight: '43px', fontWeight: '700' }],
        'heading-2': ['24px', { lineHeight: '29px', fontWeight: '700' }],
        'heading-3': ['16px', { lineHeight: '19px', fontWeight: '700' }],
        'large-bold': ['15px', { lineHeight: '21px', fontWeight: '700' }],
        'large-regular': ['15px', { lineHeight: '21px', fontWeight: '400' }],
        'normal-bold': ['12px', { lineHeight: '14px', fontWeight: '700' }],
        'normal-regular': ['12px', { lineHeight: '14px', fontWeight: '400' }],
      },
    },
  },
  plugins: [],
}
