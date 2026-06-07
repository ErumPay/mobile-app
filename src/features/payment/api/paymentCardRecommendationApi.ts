import type { PaymentCardRecommendationResponse } from '../types/paymentCardRecommendation.types';
import {
    getPaymentUserId,
    PAYMENT_API_BASE_URL,
} from './paymentApiConfig';

const PAYMENT_PREPARE_URL = `${PAYMENT_API_BASE_URL}/api/v1/payment/prepare`;
const PAYMENT_SUBSCRIBE_URL = (paymentId: number) =>
    `${PAYMENT_API_BASE_URL}/api/v1/payment/${paymentId}/subscribe`;
const PAYMENT_RECOMMENDATION_TIMEOUT_MS = 15000;

type PreparePaymentParams = {
    paymentId?: number;
    remoteRequestId?: number;
    amount: number;
    idempotencyKey: string;
    paymentType?: 'SINGLE' | 'DUTCH' | 'REMOTE';
    dutchRole?: 'MEMBER' | 'HOST';
    sessionId?: number;
    orderName?: string;
    merchantId?: number;
};

type PaymentApiErrorResponse = {
    reason?: string;
    message?: string;
};

export type PreparePaymentResponse = {
    paymentId: number;
    paymentStatus: string;
    recommendationStatus: string;
    paymentType: string;
    paymentIntent?: string;
    dutchRole?: string;
    dutchSessionId?: number;
    remoteRequestId?: number;
    amount: number;
};

const parsePaymentApiError = async (
    response: Response,
): Promise<PaymentApiErrorResponse> => {
    try {
        return response.json();
    } catch {
        return {};
    }
};

export async function preparePayment({
    paymentId,
    remoteRequestId,
    amount,
    idempotencyKey,
    paymentType = 'SINGLE',
    dutchRole,
    sessionId,
    orderName,
    merchantId,
}: PreparePaymentParams): Promise<PreparePaymentResponse> {
    const isDutchMember = paymentType === 'DUTCH' && dutchRole === 'MEMBER';
    const isDutchHost = paymentType === 'DUTCH' && dutchRole === 'HOST';
    const isRemoteProxy = paymentType === 'REMOTE' && remoteRequestId != null;
    const prepareUrl = isDutchMember
        ? `${PAYMENT_API_BASE_URL}/api/v1/payment/prepare-member`
        : isDutchHost
            ? `${PAYMENT_API_BASE_URL}/api/v1/payment/prepare-host`
            : isRemoteProxy
                ? `${PAYMENT_API_BASE_URL}/api/v1/payment/prepare-proxy`
            : PAYMENT_PREPARE_URL;
    const requestBody = isDutchMember || isDutchHost
        ? {
            amount,
            sessionId,
            orderName: orderName ?? '더치페이 결제',
            merchantId: merchantId ?? 1,
        }
        : isRemoteProxy
            ? {
                amount,
                remoteRequestId,
                orderName: orderName ?? '원격결제',
                merchantId: merchantId ?? 101,
            }
        : {
            paymentId,
            amount,
            paymentType,
        };

    const response = await fetch(prepareUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-User-Id': getPaymentUserId(),
            'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(requestBody),
    });

    if (response.status === 409) {
        const error = await parsePaymentApiError(response);

        if (error.reason === 'PAYMENT_REQUEST_IN_PROGRESS') {
            if (paymentId == null) {
                throw new Error(error.message ?? '결제 요청이 처리 중입니다.');
            }

            return {
                paymentId,
                paymentStatus: 'PAY_PENDING',
                recommendationStatus: 'PENDING',
                paymentType,
                paymentIntent: undefined,
                dutchRole,
                dutchSessionId: sessionId,
                amount,
            };
        }

        throw new Error(error.message ?? '결제 사전 승인 요청에 실패했습니다.');
    }

    if (!response.ok) {
        throw new Error('결제 사전 승인 요청에 실패했습니다.');
    }
    return response.json();
}

type SseEvent = {
    eventName: string;
    data: string;
};

type PaymentRecommendationSsePayload = {
    eventType?: string;
    payload?: PaymentCardRecommendationResponse | {
        paymentId?: number;
        status?: number;
        reason?: string;
        message?: string;
    };
};

const parseSseEvent = (rawEvent: string): SseEvent | null => {
    const lines = rawEvent.split(/\r?\n/);
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
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        let lastReadIndex = 0;
        let buffer = '';
        let settled = false;

        const cleanup = () => {
            clearTimeout(timeoutId);
            xhr.onreadystatechange = null;
            xhr.onprogress = null;
            xhr.onerror = null;
            xhr.ontimeout = null;
            xhr.onloadend = null;
        };
        const settleResolve = (value: PaymentCardRecommendationResponse) => {
            if (settled) {
                return;
            }

            settled = true;
            cleanup();
            xhr.abort();
            resolve(value);
        };
        const settleReject = (error: Error) => {
            if (settled) {
                return;
            }

            settled = true;
            cleanup();
            xhr.abort();
            reject(error);
        };
        const processRawEvent = (rawEvent: string) => {
            const event = parseSseEvent(rawEvent);

            if (!event) {
                return;
            }

            if (event.eventName === 'payment-updated') {
                const ssePayload = JSON.parse(event.data) as PaymentRecommendationSsePayload;

                if (ssePayload.eventType === 'RECOMMENDATION_FAILED') {
                    const failurePayload = ssePayload.payload as
                        | { reason?: string; message?: string }
                        | undefined;

                    settleReject(
                        new Error(
                            failurePayload?.message ??
                            failurePayload?.reason ??
                            '카드추천 실패',
                        ),
                    );
                    return;
                }

                if (ssePayload.eventType === 'RECOMMENDATION_SUCCEEDED') {
                    settleResolve(ssePayload.payload as PaymentCardRecommendationResponse);
                }

                return;
            }

            if (event.eventName === '카드추천 실패') {
                settleReject(new Error('카드추천 실패'));
                return;
            }

            if (event.eventName === '카드추천 조합') {
                settleResolve(JSON.parse(event.data));
            }
        };
        const readAvailableEvents = () => {
            const nextChunk = xhr.responseText.slice(lastReadIndex);
            lastReadIndex = xhr.responseText.length;
            buffer += nextChunk;

            const rawEvents = buffer.split(/\r?\n\r?\n/);
            buffer = rawEvents.pop() ?? '';
            rawEvents.forEach(processRawEvent);
        };
        const timeoutId = setTimeout(() => {
            settleReject(new Error('카드추천 응답 시간이 초과되었습니다.'));
        }, PAYMENT_RECOMMENDATION_TIMEOUT_MS);

        xhr.open('GET', PAYMENT_SUBSCRIBE_URL(paymentId));
        xhr.setRequestHeader('Accept', 'text/event-stream');
        xhr.setRequestHeader('X-User-Id', getPaymentUserId());
        xhr.onreadystatechange = () => {
            if (xhr.readyState >= XMLHttpRequest.HEADERS_RECEIVED && xhr.status >= 400) {
                settleReject(new Error('결제 카드 추천 정보를 구독하지 못했습니다.'));
            }
        };
        xhr.onprogress = readAvailableEvents;
        xhr.onerror = () => {
            settleReject(new Error('결제 카드 추천 정보를 구독하지 못했습니다.'));
        };
        xhr.ontimeout = () => {
            settleReject(new Error('카드추천 응답 시간이 초과되었습니다.'));
        };
        xhr.onloadend = () => {
            if (!settled) {
                readAvailableEvents();
                settleReject(new Error('결제 카드 추천 정보를 받지 못했습니다.'));
            }
        };
        xhr.send();
    });
}
