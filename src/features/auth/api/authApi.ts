import * as SecureStore from 'expo-secure-store';
import { AUTH_API_URL, getAuthDevUserId } from './authApiConfig';

export type SendSmsResponse = {
  verificationId: number;
  smsReceiverNumber: string;
  verificationCode: string;
  expiresAt: string;
};

export type VerifySmsResponse = {
  verified: boolean;
};

export type SetupPinResponse = {
  message: string;
};

export type ResetPinResponse = {
  message: string;
};

type DevUserResponse = {
  userId: string;
  kakaoOauthId: string;
  status: string;
};

type DevTokenResponse = {
  userId: string;
  status: string;
  accessToken: string;
  refreshToken: string;
};

export type AuthRequestOptions = {
  useExistingDevUser?: boolean;
};

const SECURE_STORE_KEYS = {
  ACCESS_TOKEN: 'auth_accessToken',
  REFRESH_TOKEN: 'auth_refreshToken',
  USER_ID: 'auth_userId',
} as const;

let authSession: { accessToken: string; refreshToken?: string; userId?: number } | null = null;

export async function setAuthSession(accessToken: string, refreshToken?: string, userId?: number) {
  authSession = { accessToken, refreshToken, userId };
  await SecureStore.setItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN, accessToken);
  if (refreshToken) {
    await SecureStore.setItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN, refreshToken);
  } else {
    await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN);
  }
  if (userId != null) {
    await SecureStore.setItemAsync(SECURE_STORE_KEYS.USER_ID, String(userId));
  } else {
    await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.USER_ID);
  }
}

export async function loadAuthSession(): Promise<boolean> {
  const accessToken = await SecureStore.getItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN);
  if (!accessToken) return false;
  const refreshToken = await SecureStore.getItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN);
  const userIdStr = await SecureStore.getItemAsync(SECURE_STORE_KEYS.USER_ID);
  authSession = {
    accessToken,
    refreshToken: refreshToken ?? undefined,
    userId: userIdStr ? Number(userIdStr) : undefined,
  };

  // 토큰 유효성 검증: refresh 실패 시 세션 무효 처리
  const refreshed = await refreshAccessToken();
  if (!refreshed) {
    await clearAuthSession();
    return false;
  }
  return true;
}

export async function clearAuthSession() {
  authSession = null;
  await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN);
  await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN);
  await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.USER_ID);
}

let refreshPromise: Promise<boolean> | null = null;

export async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = doRefresh();
  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function doRefresh(): Promise<boolean> {
  const rt = authSession?.refreshToken;
  if (!rt) return false;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const response = await fetch(`${AUTH_API_URL}/token/refresh`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${rt}` },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) return false;
    const data = await response.json();
    await setAuthSession(data.accessToken, data.refreshToken ?? rt, authSession?.userId);
    return true;
  } catch {
    return false;
  }
}

export function getAuthSessionUserId(): number | null {
  return authSession?.userId ?? null;
}

export function getAuthSessionAccessToken(): string | null {
  return authSession?.accessToken ?? null;
}
const REQUEST_TIMEOUT_MS = 10000;

export class AuthApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'AuthApiError';
    this.status = status;
  }
}

export type AgreeTermsResponse = {
    message: string;                                                                          
  };
                                                                                              
  export async function agreeTerms(
    accessToken: string,                                                                    
    serviceTermsAgreed: boolean,
    privacyTermsAgreed: boolean,
    marketingTermsAgreed: boolean,
  ): Promise<AgreeTermsResponse> {                                                            
    const response = await fetchAuth(`${AUTH_API_URL}/terms/agree`, {
      method: 'POST',                                                                         
      headers: {  
        'Content-Type': 'application/json',                                                 
        Authorization: `Bearer ${accessToken}`,
      },                                                                                      
      body: JSON.stringify({
        serviceTermsAgreed,                                                                   
        privacyTermsAgreed,
        marketingTermsAgreed,                                                               
      }),
    });

    if (!response.ok) {                                                                       
      const error = await response.json().catch(() => null);
      throw new AuthApiError(                                                                 
        error?.message ?? '약관 동의에 실패했습니다.',
        response.status,                                                                    
      );
    }

    return response.json();                                                                   
  }
                                                                                              
  export async function sendSmsCode(phoneNumber: string, options?: AuthRequestOptions):
  Promise<SendSmsResponse> {
  const accessToken = await getAccessTokenForAuthRequest(phoneNumber, options);
  const response = await fetchAuth(`${AUTH_API_URL}/sms/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ phoneNumber }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new AuthApiError(error?.message ?? 'SMS 인증번호 발송에 실패했습니다.', response.status);
  }

  return response.json();
}

export async function verifySmsCode(verificationId: number, code: string): Promise<VerifySmsResponse> {
  const response = await fetchAuth(`${AUTH_API_URL}/sms/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ verificationId, code }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new AuthApiError(error?.message ?? '인증번호 확인에 실패했습니다.', response.status);
  }

  return response.json();
}

export async function setupPin(pin: string, pinConfirm: string): Promise<SetupPinResponse> {
  const accessToken = await getAccessTokenForAuthRequest();
  const response = await fetchAuth(`${AUTH_API_URL}/pin/setup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ pin, pinConfirm }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new AuthApiError(error?.message ?? 'PIN 설정에 실패했습니다.', response.status);
  }

  return response.json();
}

export async function resetPin(
  verificationId: number,
  newPin: string,
  newPinConfirm: string,
): Promise<ResetPinResponse> {
  const accessToken = await getAccessTokenForAuthRequest(undefined, {
    useExistingDevUser: true,
  });
  const response = await fetchAuth(`${AUTH_API_URL}/pin/reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ verificationId, newPin, newPinConfirm }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new AuthApiError(error?.message ?? 'PIN 재설정에 실패했습니다.', response.status);
  }

  return response.json();
}

export async function fetchAuth(input: RequestInfo, init?: RequestInit) {
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      controller.abort();
      reject(new Error('인증 서버 연결 시간이 초과되었습니다.'));
    }, REQUEST_TIMEOUT_MS);
  });

  try {
    const response = await Promise.race([
      fetch(input, {
        ...init,
        signal: controller.signal,
      }),
      timeoutPromise,
    ]);

    if (response.status === 401 && authSession?.refreshToken) {
      const refreshed = await refreshAccessToken();
      if (refreshed && authSession?.accessToken) {
        const retryInit = { ...init };
        if (retryInit.headers && typeof retryInit.headers === 'object') {
          retryInit.headers = {
            ...retryInit.headers,
            Authorization: `Bearer ${authSession.accessToken}`,
          };
        }
        const retryController = new AbortController();
        const retryTimeout = setTimeout(() => retryController.abort(), REQUEST_TIMEOUT_MS);
        try {
          return await fetch(input, { ...retryInit, signal: retryController.signal });
        } finally {
          clearTimeout(retryTimeout);
        }
      }
      await clearAuthSession();
    }

    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('인증 서버 연결 시간이 초과되었습니다.');
    }

    throw error;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export async function getAccessTokenForAuthRequest(phoneNumber?: string, options?: AuthRequestOptions) {
  if (authSession?.accessToken) {
    return authSession.accessToken;
  }

  const configuredToken = process.env.EXPO_PUBLIC_DEV_ACCESS_TOKEN;

  if (__DEV__ && configuredToken) {
    return configuredToken;
  }

  if (__DEV__ && options?.useExistingDevUser) {
    const devSession = await issueDevToken(getAuthDevUserId());
    authSession = {
      accessToken: devSession.accessToken,
      refreshToken: devSession.refreshToken,
      userId: Number(devSession.userId),
    };
    return authSession.accessToken;
  }

  if (!__DEV__) {
    throw new Error('로그인 후 다시 시도해주세요.');
  }

  const devUser = await createDevUser(phoneNumber);
  const devSession = await issueDevToken(devUser.userId);
  authSession = {
    accessToken: devSession.accessToken,
    refreshToken: devSession.refreshToken,
    userId: Number(devSession.userId),
  };
  return authSession.accessToken;
}

async function createDevUser(phoneNumber?: string): Promise<DevUserResponse> {
  const response = await fetchAuth(`${AUTH_API_URL}/dev/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      kakaoOauthId: `mobile-dev-user-${getAuthDevUserId()}`,
      phoneNumber,
      name: 'Mobile Dev User',
      status: 'PENDING',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? '개발용 인증 사용자를 생성하지 못했습니다.');
  }

  return response.json();
}

async function issueDevToken(userId: string): Promise<DevTokenResponse> {
  const response = await fetchAuth(`${AUTH_API_URL}/dev/token/${userId}`);

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? '개발용 인증 토큰 발급에 실패했습니다.');
  }

  return response.json();
}
