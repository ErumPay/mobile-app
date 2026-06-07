export type PaymentRequestCard = {
    cardId: number;
    amount: number;
};

export type PaymentRequestPayload = {
    pin: string;
    paymentId: number;
    totalAmount: number;
    strategyType: string;
    cards: PaymentRequestCard[];
};

export type PaymentRequestResponse = {
    paymentId: number;
    userId: number;
    paymentStatus: string;
    paymentType: string;
    dutchSessionId?: number;
};

export type PaymentRequestErrorDetails = {
    failCount?: number;
    remainCount?: number;
    lockedUntil?: string;
    requireSmsVerification?: boolean;
};

export type PaymentRequestErrorBody = {
    status?: number;
    error?: string;
    code?: string;
    reason?: string;
    message?: string;
    details?: PaymentRequestErrorDetails;
};
