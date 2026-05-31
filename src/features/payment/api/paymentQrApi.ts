import type { PaymentQrValidateResponse } from '../types/paymentQr.types';

const PAYMENT_QR_VALIDATE_URL =
    'http://localhost:8083/api/v1/payment/qr/validate';

export async function validatePaymentQr(): Promise<PaymentQrValidateResponse> {
    const response = await fetch(PAYMENT_QR_VALIDATE_URL);

    if (!response.ok) {
        throw new Error('QR 결제 정보를 불러오지 못했습니다.');
    }

    return response.json();
}
