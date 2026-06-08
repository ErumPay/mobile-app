import { AUTH_API_URL } from './authApiConfig';

const KAKAO_REST_API_KEY = '3338ab0088875b9e2ba0e4a620d33ae0';
const KAKAO_REDIRECT_URI = 'http://localhost:19000/auth/callback';

/** WebView에서 열 카카오 인가 URL */
export const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}&response_type=code&scope=name,phone_number`;

export { KAKAO_REDIRECT_URI };

export type KakaoLoginResult = {
  newUser: boolean;
  userId: number;
  name: string;
  accessToken: string;
  refreshToken: string;
  status: string;
};

/**
 * 카카오 인가 코드를 백엔드로 전송하여 로그인/회원가입 처리
 */
export async function processKakaoAuthCode(code: string): Promise<KakaoLoginResult> {
  const url = `${AUTH_API_URL}/kakao/login`;
  console.log('[카카오] fetch URL:', url);
  console.log('[카카오] redirectUri:', KAKAO_REDIRECT_URI);
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      authorizationCode: code,
      redirectUri: KAKAO_REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? '카카오 로그인에 실패했습니다.');
  }

  return response.json();
}
