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

export async function sendSmsCode(phoneNumber: string): Promise<SendSmsResponse> {
  const response = await fetch(`${AUTH_API_URL}/sms/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': getAuthDevUserId(),
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
  const response = await fetch(`${AUTH_API_URL}/sms/verify`, {
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
  const response = await fetch(`${AUTH_API_URL}/pin/setup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': getAuthDevUserId(),
    },
    body: JSON.stringify({ pin, pinConfirm }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? 'PIN 설정에 실패했습니다.');
  }

  return response.json();
}
