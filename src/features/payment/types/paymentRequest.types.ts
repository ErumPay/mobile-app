export type PaymentRequestCard = {
    cardId: number;
    amount: number;
};

export type PaymentRequestPayload = {
    pin: string;
    paymentId: number;
    totalAmount: number;
    cards: PaymentRequestCard[];
};

export type PaymentRequestResponse = {
    paymentId: number;
    userId: number;
    paymentStatus: string;
    paymentType: string;
};
