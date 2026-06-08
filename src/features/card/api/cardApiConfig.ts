import Constants from 'expo-constants';

import { getAuthSessionUserId } from '../../auth/api/authApi';

function getDevHost(): string {
  const debuggerHost =
    Constants.expoGoConfig?.debuggerHost ?? (Constants as any).manifest?.debuggerHost;
  if (debuggerHost) {
    return debuggerHost.split(':')[0];
  }
  return 'localhost';
}

export const CARD_API_BASE_URL =
  process.env.EXPO_PUBLIC_CARD_API_BASE_URL ?? `http://${getDevHost()}:8082`;

export const CARD_OCR_BASE_URL =
  process.env.EXPO_PUBLIC_CARD_OCR_BASE_URL ?? 'http://localhost:8086';

export const CARD_API_TIMEOUT_MS = 15000;

export function getCardRegisterUserId(): number {
  const sessionUserId = getAuthSessionUserId();
  if (sessionUserId != null) {
    return sessionUserId;
  }

  if (__DEV__) {
    return Number(process.env.EXPO_PUBLIC_DEV_USER_ID ?? '2');
  }

  throw new Error('카드 등록 사용자 정보 연동이 필요합니다.');
}
