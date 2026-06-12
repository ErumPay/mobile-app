import type { PaymentRequestSummary } from '../types/paymentMethod.types';
import type { PaymentQrValidateResponse } from '../types/paymentQr.types';

export function toPaymentRequestSummary(
    response: PaymentQrValidateResponse,
): PaymentRequestSummary {
    return {
        paymentId: response.paymentId,
        merchantName: response.merchant_name,
        amount: response.amount,
        type: response.channel_type,
    };
}
