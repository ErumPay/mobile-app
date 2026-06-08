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

export const PAYMENT_API_BASE_URL =
    process.env.EXPO_PUBLIC_PAYMENT_API_BASE_URL ??
    process.env.EXPO_PUBLIC_API_BASE_URL ??
    `http://${getDevHost()}:8083`;

export function getPaymentUserId(): string {
    const sessionUserId = getAuthSessionUserId();
    if (sessionUserId != null) {
        return String(sessionUserId);
    }

    if (__DEV__) {
        return process.env.EXPO_PUBLIC_DEV_USER_ID ?? '1';
    }

    throw new Error('로그인 사용자 정보가 없습니다.');
}
