import type {
    PaymentRequestPayload,
    PaymentRequestResponse,
} from '../types/paymentRequest.types';
import { createPaymentIdempotencyKey } from '../utils/paymentIdempotencyKey';

const PAYMENT_REQUEST_URL = 'http://localhost:8083/api/v1/payment/request';
const DEV_USER_ID = '1';

export async function requestPayment(
    payload: PaymentRequestPayload,
): Promise<PaymentRequestResponse> {
    const response = await fetch(PAYMENT_REQUEST_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-User-Id': DEV_USER_ID,
            'Idempotency-Key': createPaymentIdempotencyKey(payload.paymentId),
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error('결제 요청에 실패했습니다.');
    }

    return response.json();
}
