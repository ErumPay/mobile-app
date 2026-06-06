const authApiBaseUrl = process.env.EXPO_PUBLIC_AUTH_API_BASE_URL;

if (!authApiBaseUrl && !__DEV__) {
  throw new Error('EXPO_PUBLIC_AUTH_API_BASE_URL 환경변수가 필요합니다.');
}

export const AUTH_API_BASE_URL = authApiBaseUrl ?? 'http://localhost:8081';

export const AUTH_API_URL = `${AUTH_API_BASE_URL}/api/v1/auth`;

export function getAuthDevUserId(): string {
  if (__DEV__) {
    return process.env.EXPO_PUBLIC_DEV_USER_ID ?? '1';
  }

  throw new Error('인증 사용자 정보 연동이 필요합니다.');
}
