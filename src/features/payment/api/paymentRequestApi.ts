import type {
    PaymentRequestPayload,
    PaymentRequestResponse,
} from '../types/paymentRequest.types';
import {
    getPaymentUserId,
    PAYMENT_API_BASE_URL,
} from './paymentApiConfig';

const PAYMENT_REQUEST_URL = `${PAYMENT_API_BASE_URL}/api/v1/payment/request`;

export async function requestPayment(
    payload: PaymentRequestPayload,
    idempotencyKey: string,
): Promise<PaymentRequestResponse> {
    const response = await fetch(PAYMENT_REQUEST_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-User-Id': getPaymentUserId(),
            'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error('결제 요청에 실패했습니다.');
    }

    return response.json();
}
