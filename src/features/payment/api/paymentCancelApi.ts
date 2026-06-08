import { getPaymentUserId, PAYMENT_API_BASE_URL } from './paymentApiConfig';

export type PaymentCancelResponse = {
  paymentId: number;
  status: string;
  canceledAt?: string;
};

export class PaymentCancelError extends Error {
  status?: number;
  code?: string;

  constructor(message: string, options?: { status?: number; code?: string }) {
    super(message);
    this.name = 'PaymentCancelError';
    this.status = options?.status;
    this.code = options?.code;
  }
}

export async function cancelPayment(
  paymentId: number,
  idempotencyKey: string,
): Promise<PaymentCancelResponse> {
  const response = await fetch(
    `${PAYMENT_API_BASE_URL}/api/v1/payment/${paymentId}/cancel`,
    {
      method: 'POST',
      headers: {
        'X-User-Id': getPaymentUserId(),
        'Idempotency-Key': idempotencyKey,
      },
    },
  );

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as
      | {
          code?: string;
          errorCode?: string;
          message?: string;
          reason?: string;
        }
      | null;

    throw new PaymentCancelError(
      errorBody?.message ?? getPaymentCancelFallbackMessage(response.status),
      {
        status: response.status,
        code: errorBody?.reason ?? errorBody?.code ?? errorBody?.errorCode,
      },
    );
  }

  return response.json();
}

function getPaymentCancelFallbackMessage(status: number) {
  if (status === 404) return '결제 정보를 찾을 수 없습니다.';
  if (status === 409) return '취소할 수 없는 결제입니다.';
  return '결제 취소 요청에 실패했습니다.';
}
