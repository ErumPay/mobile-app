import type { PaymentQrValidateResponse } from '../types/paymentQr.types';
import { PAYMENT_API_BASE_URL } from './paymentApiConfig';

const PAYMENT_QR_VALIDATE_URL =
    `${PAYMENT_API_BASE_URL}/api/v1/payment/qr/validate`;

export async function validatePaymentQr(
    token: string,
): Promise<PaymentQrValidateResponse> {
    const response = await fetch(PAYMENT_QR_VALIDATE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            token,
        }),
    });

    if (!response.ok) {
        throw new Error('QR 결제 정보를 불러오지 못했습니다.');
    }

    return response.json();
}
