import type {
    DirectPaymentRequestPayload,
    PaymentRequestErrorBody,
    PaymentRequestErrorDetails,
    PaymentRequestPayload,
    PaymentRequestResponse,
} from '../types/paymentRequest.types';
import {
    getPaymentUserId,
    PAYMENT_API_BASE_URL,
} from './paymentApiConfig';

const PAYMENT_REQUEST_URL = `${PAYMENT_API_BASE_URL}/api/v1/payment/request`;
const PAYMENT_DIRECT_REQUEST_URL = `${PAYMENT_API_BASE_URL}/api/v1/payment/request-direct`;
const PAYMENT_REQUEST_TIMEOUT_MS = 15_000;

export class PaymentRequestError extends Error {
    code?: string;
    details?: PaymentRequestErrorDetails;
    status?: number;

    constructor(body: PaymentRequestErrorBody) {
        super(body.message ?? '결제 요청에 실패했습니다.');
        this.name = 'PaymentRequestError';
        this.code = body.reason ?? body.code;
        this.details = body.details;
        this.status = body.status;
    }
}

export async function requestPayment(
    payload: PaymentRequestPayload,
    idempotencyKey: string,
): Promise<PaymentRequestResponse> {
    return postPaymentRequest(PAYMENT_REQUEST_URL, payload, idempotencyKey);
}

export async function requestDirectPayment(
    payload: DirectPaymentRequestPayload,
    idempotencyKey: string,
): Promise<PaymentRequestResponse> {
    return postPaymentRequest(PAYMENT_DIRECT_REQUEST_URL, payload, idempotencyKey);
}

async function postPaymentRequest(
    url: string,
    payload: PaymentRequestPayload | DirectPaymentRequestPayload,
    idempotencyKey: string,
): Promise<PaymentRequestResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
        () => controller.abort(),
        PAYMENT_REQUEST_TIMEOUT_MS,
    );

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': getPaymentUserId(),
                'Idempotency-Key': idempotencyKey,
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });

        if (!response.ok) {
            const errorBody = await response
                .json()
                .catch(() => null) as PaymentRequestErrorBody | null;

            if (errorBody) {
                throw new PaymentRequestError(errorBody);
            }

            throw new Error('결제 요청에 실패했습니다.');
        }

        return response.json();
    } finally {
        clearTimeout(timeoutId);
    }
}
