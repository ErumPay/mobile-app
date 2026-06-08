import Constants from 'expo-constants';

import { AUTH_API_BASE_URL } from '../../auth/api/authApiConfig';
import { getAuthSessionUserId } from '../../auth/api/authApi';

function getDevHost(): string {
  const debuggerHost =
    Constants.expoGoConfig?.debuggerHost ?? (Constants as any).manifest?.debuggerHost;
  if (debuggerHost) {
    return debuggerHost.split(':')[0];
  }
  return 'localhost';
}

function getDevServiceBaseUrl(port: number): string {
  return `http://${getDevHost()}:${port}`;
}

export const MYPAGE_CARD_API_BASE_URL =
  process.env.EXPO_PUBLIC_CARD_API_BASE_URL ?? getDevServiceBaseUrl(8082);

export const MYPAGE_AUTH_API_BASE_URL =
  process.env.EXPO_PUBLIC_AUTH_API_BASE_URL ?? AUTH_API_BASE_URL;

export const MYPAGE_PAYMENT_API_BASE_URL =
  process.env.EXPO_PUBLIC_PAYMENT_API_BASE_URL ??
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  getDevServiceBaseUrl(8083);

export const MYPAGE_API_TIMEOUT_MS = 15000;

export function getMypageUserId(): number {
  const sessionUserId = getAuthSessionUserId();
  if (sessionUserId != null) {
    return sessionUserId;
  }

  if (__DEV__) {
    return Number(process.env.EXPO_PUBLIC_DEV_USER_ID ?? '2');
  }

  throw new Error('로그인 사용자 정보가 없습니다.');
}
