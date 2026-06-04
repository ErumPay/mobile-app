declare module '*.css';

declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_API_BASE_URL?: string;
    EXPO_PUBLIC_AUTH_API_BASE_URL?: string;
    EXPO_PUBLIC_CARD_API_BASE_URL?: string;
    EXPO_PUBLIC_CARD_OCR_BASE_URL?: string;
    EXPO_PUBLIC_DEV_USER_ID?: string;
  }
}
