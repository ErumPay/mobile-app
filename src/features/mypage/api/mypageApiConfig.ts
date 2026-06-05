export const MYPAGE_CARD_API_BASE_URL =
  process.env.EXPO_PUBLIC_CARD_API_BASE_URL ?? 'http://localhost:8082';

export const MYPAGE_AUTH_API_BASE_URL =
  process.env.EXPO_PUBLIC_AUTH_API_BASE_URL ?? 'http://localhost:8081';

export const MYPAGE_API_TIMEOUT_MS = 15000;

export function getMypageUserId(): number {
  if (__DEV__) {
    return Number(process.env.EXPO_PUBLIC_DEV_USER_ID ?? '2');
  }

  throw new Error('Mypage user id is required.');
}
