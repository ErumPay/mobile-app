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

let authSession: DevTokenResponse | null = null;
const REQUEST_TIMEOUT_MS = 10000;

export async function sendSmsCode(phoneNumber: string): Promise<SendSmsResponse> {
  const accessToken = await getAccessTokenForAuthRequest(phoneNumber);
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
    throw new Error(error?.message ?? 'SMS 인증번호 발송에 실패했습니다.');
  }

  return response.json();
}

export async function verifySmsCode(
  verificationId: number,
  code: string,
): Promise<VerifySmsResponse> {
  const response = await fetchAuth(`${AUTH_API_URL}/sms/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ verificationId, code }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? '인증번호 확인에 실패했습니다.');
  }

  return response.json();
}

export async function setupPin(
  pin: string,
  pinConfirm: string,
): Promise<SetupPinResponse> {
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
    throw new Error(error?.message ?? 'PIN 설정에 실패했습니다.');
  }

  return response.json();
}

async function fetchAuth(input: RequestInfo, init?: RequestInit) {
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      controller.abort();
      reject(new Error('인증 서버 연결 시간이 초과되었습니다.'));
    }, REQUEST_TIMEOUT_MS);
  });

  try {
    return await Promise.race([
      fetch(input, {
        ...init,
        signal: controller.signal,
      }),
      timeoutPromise,
    ]);
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

async function getAccessTokenForAuthRequest(phoneNumber?: string) {
  if (authSession?.accessToken) {
    return authSession.accessToken;
  }

  if (!__DEV__) {
    throw new Error('로그인 후 다시 시도해주세요.');
  }

  const devUser = await createDevUser(phoneNumber);
  authSession = await issueDevToken(devUser.userId);
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
