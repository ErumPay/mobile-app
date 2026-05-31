import type { PaymentCardRecommendationResponse } from '../types/paymentCardRecommendation.types';

const PAYMENT_CARD_RECOMMENDATION_URL = (paymentId: number) =>
    `http://localhost:8083/api/v1/payment/${paymentId}/subscribe`;

export async function getPaymentCardRecommendations(
    paymentId: number,
): Promise<PaymentCardRecommendationResponse> {
    const response = await fetch(PAYMENT_CARD_RECOMMENDATION_URL(paymentId));

    if (!response.ok) {
        throw new Error('결제 카드 추천 정보를 불러오지 못했습니다.');
    }

    return response.json();
}
