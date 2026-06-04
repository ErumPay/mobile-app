import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const KAKAO_REST_API_KEY = '3338ab0088875b9e2ba0e4a620d33ae0';
const KAKAO_CLIENT_SECRET = 'gr9qHQkDbF22h1h3uqYorum8j8R6fojM';
const REDIRECT_URI = AuthSession.makeRedirectUri({ path: 'auth/callback' });

const discovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: 'https://kauth.kakao.com/oauth/authorize',
  tokenEndpoint: 'https://kauth.kakao.com/oauth/token',
};

export type KakaoUserInfo = {
  id: number;
  name?: string;
  phone?: string;
};

/**
 * 카카오 REST API로 access token 교환
 */
async function exchangeCodeForToken(code: string): Promise<string> {
  const response = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: KAKAO_REST_API_KEY,
      client_secret: KAKAO_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      code,
    }).toString(),
  });

  if (!response.ok) {
    throw new Error('카카오 토큰 교환에 실패했습니다.');
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * access token으로 카카오 사용자 정보 조회
 */
async function fetchKakaoUserInfo(accessToken: string): Promise<KakaoUserInfo> {
  const response = await fetch('https://kapi.kakao.com/v2/user/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error('카카오 사용자 정보 조회에 실패했습니다.');
  }

  const data = await response.json();
  return {
    id: data.id,
    name: data.kakao_account?.name,
    phone: data.kakao_account?.phone_number,
  };
}

/**
 * 카카오 로그인 전체 흐름
 * 1. 브라우저에서 카카오 로그인 → 인가 코드 받기
 * 2. 인가 코드 → access token 교환
 * 3. access token → 사용자 정보 조회
 */
export async function loginWithKakao(): Promise<KakaoUserInfo> {
  const request = new AuthSession.AuthRequest({
    clientId: KAKAO_REST_API_KEY,
    redirectUri: REDIRECT_URI,
    scopes: ['name', 'phone_number'],
    responseType: AuthSession.ResponseType.Code,
    usePKCE: false,
  });

  const result = await request.promptAsync(discovery);

  if (result.type !== 'success' || !result.params.code) {
    throw new Error('카카오 로그인이 취소되었습니다.');
  }

  const accessToken = await exchangeCodeForToken(result.params.code);
  const userInfo = await fetchKakaoUserInfo(accessToken);

  return userInfo;
}

/**
 * 디버그용: 현재 redirect URI 확인
 */
export function getRedirectUri(): string {
  return REDIRECT_URI;
}
