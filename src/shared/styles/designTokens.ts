/******************************************************************************
 * File: designTokens.ts
 * Description: Style Guide 기준 컬러/타이포그래피 디자인 토큰 정의
 * Worker: [FE] 조보름
 * Created: 2026-05-29
 * Note: NativeWind 설정과 코드 내부 스타일 참조값을 맞추기 위해 생성했습니다.
 ******************************************************************************/

export const colors = {
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
    disabled: '#B4B8BD',
    white: '#FFFFFF',
  },
} as const;

export const typography = {
  fontFamily: 'Pretendard',
  heading1: {
    fontSize: 36,
    lineHeight: 43,
    fontWeight: '600',
  },
  heading2: {
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '600',
  },
  heading3: {
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '600',
  },
  largeBold: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
  },
  largeRegular: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '400',
  },
  normalBold: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '600',
  },
  normalRegular: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '400',
  },
} as const;

export type ColorTokens = typeof colors;
export type TypographyTokens = typeof typography;
