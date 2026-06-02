import type { PaymentCardRecommendationResponse } from '../types/paymentCardRecommendation.types';
import { createPaymentIdempotencyKey } from '../utils/paymentIdempotencyKey';

const API_BASE_URL = 'http://localhost:8083';
const DEV_USER_ID = '1';

const PAYMENT_PREPARE_URL = `${API_BASE_URL}/api/v1/payment/prepare`;
const PAYMENT_SUBSCRIBE_URL = (paymentId: number) =>
    `${API_BASE_URL}/api/v1/payment/${paymentId}/subscribe`;

type PreparePaymentParams = {
    paymentId: number;
    amount: number;
};

type PaymentApiErrorResponse = {
    reason?: string;
    message?: string;
};

const parsePaymentApiError = async (
    response: Response,
): Promise<PaymentApiErrorResponse> => {
    try {
        return await response.json();
    } catch {
        return {};
    }
};

export async function preparePayment({
    paymentId,
    amount,
}: PreparePaymentParams): Promise<void> {
    const response = await fetch(PAYMENT_PREPARE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-User-Id': DEV_USER_ID,
            'Idempotency-Key': createPaymentIdempotencyKey(paymentId),
        },
        body: JSON.stringify({
            paymentId,
            amount,
            paymentType: 'SINGLE',
        }),
    });

    if (response.status === 409) {
        const error = await parsePaymentApiError(response);

        if (error.reason === 'PAYMENT_REQUEST_IN_PROGRESS') {
            return;
        }

        throw new Error(error.message ?? '결제 사전 승인 요청에 실패했습니다.');
    }

    if (!response.ok) {
        throw new Error('결제 사전 승인 요청에 실패했습니다.');
    }
}

type SseEvent = {
    eventName: string;
    data: string;
};

const parseSseEvent = (rawEvent: string): SseEvent | null => {
    const lines = rawEvent.split('\n');
    const eventName =
        lines
            .find((line) => line.startsWith('event:'))
            ?.replace('event:', '')
            .trim() ?? '';
    const data = lines
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.replace('data:', '').trim())
        .join('\n');

    if (!eventName || !data) {
        return null;
    }

    return {
        eventName,
        data,
    };
};

export async function subscribePaymentCardRecommendations(
    paymentId: number,
): Promise<PaymentCardRecommendationResponse> {
    const response = await fetch(PAYMENT_SUBSCRIBE_URL(paymentId), {
        headers: {
            Accept: 'text/event-stream',
            'X-User-Id': DEV_USER_ID,
        },
    });
    const responseBody = (response as unknown as { body?: any }).body;

    if (!response.ok || !responseBody) {
        throw new Error('결제 카드 추천 정보를 구독하지 못했습니다.');
    }

    const reader = responseBody.getReader();
    const TextDecoderConstructor = (globalThis as unknown as {
        TextDecoder?: new () => { decode: (input: unknown, options?: unknown) => string };
    }).TextDecoder;

    if (!TextDecoderConstructor) {
        throw new Error('SSE 응답을 읽을 수 없는 실행 환경입니다.');
    }

    const decoder = new TextDecoderConstructor();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();

        if (done) {
            break;
        }

        buffer += decoder.decode(value, { stream: true });
        const rawEvents = buffer.split('\n\n');
        buffer = rawEvents.pop() ?? '';

        for (const rawEvent of rawEvents) {
            const event = parseSseEvent(rawEvent);

            if (!event) {
                continue;
            }

            if (event.eventName === '카드추천 실패') {
                throw new Error('카드추천 실패');
            }

            if (event.eventName === '카드추천 조합') {
                reader.cancel().catch(() => {});
                return JSON.parse(event.data);
            }
        }
    }

    throw new Error('결제 카드 추천 정보를 받지 못했습니다.');
}
