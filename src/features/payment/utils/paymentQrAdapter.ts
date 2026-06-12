import type { PaymentRequestSummary } from '../types/paymentMethod.types';
import type { PaymentQrValidateResponse } from '../types/paymentQr.types';

export function toPaymentRequestSummary(
    response: PaymentQrValidateResponse,
): PaymentRequestSummary {
    if (response.channel_type === 'REMOTE_RECIPIENT') {
        return {
            paymentId: response.paymentId,
            remoteRequestId: response.paymentId,
            payerPaymentId: response.paymentId,
            merchantName: response.order_name,
            amount: response.amount,
            type: 'REMOTE_RECIPIENT',
        };
    }

    return {
        paymentId: response.paymentId,
        merchantName: response.order_name,
        amount: response.amount,
        type: response.channel_type,
    };
}
