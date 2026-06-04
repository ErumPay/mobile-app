import type { PaymentQrValidateResponse } from '../types/paymentQr.types';
import type { OfflinePaymentQrRequestPayload } from '../types/offlinePaymentQr.types';
import { PAYMENT_API_BASE_URL } from './paymentApiConfig';

const PAYMENT_QR_VALIDATE_URL =
    `${PAYMENT_API_BASE_URL}/api/v1/payment/qr/validate`;
const PAYMENT_QR_REQUEST_URL =
    `${PAYMENT_API_BASE_URL}/api/v1/payment/qr/request`;

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

export async function requestOfflinePaymentQrImage(
    payload: OfflinePaymentQrRequestPayload,
): Promise<string> {
    const response = await fetch(PAYMENT_QR_REQUEST_URL, {
        method: 'POST',
        headers: {
            Accept: 'image/png',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error('오프라인 결제 QR을 생성하지 못했습니다.');
    }

    const blob = await response.blob();

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
                return;
            }

            reject(new Error('QR 이미지 응답을 읽지 못했습니다.'));
        };

        reader.onerror = () => {
            reject(new Error('QR 이미지 응답을 읽지 못했습니다.'));
        };

        reader.readAsDataURL(blob);
    });
}
