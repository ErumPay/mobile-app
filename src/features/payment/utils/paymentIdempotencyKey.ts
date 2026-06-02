export const createPaymentIdempotencyKey = (paymentId: number): string =>
    `payment-prepare-${paymentId}`;
