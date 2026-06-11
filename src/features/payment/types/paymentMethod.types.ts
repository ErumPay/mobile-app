export type PaymentRequestType =
    | 'OFFLINE'
    | 'ONLINE'
    | 'DUTCH_PAY_PARTICIPANT'
    | 'REMOTE_RECIPIENT';

export type PaymentRequestSummary = {
    paymentId: number;
    remoteRequestId?: number;
    payerPaymentId?: number;
    merchantName: string;
    amount: number;
    type: PaymentRequestType;
    requesterName?: string;
    dutchPayOwnerName?: string;
};

export type PaymentActionType =
    | 'PAY'
    | 'REMOTE_REQUEST'
    | 'DUTCH_PAY'
    | 'REJECT';

export type PaymentActionOption = {
    type: PaymentActionType;
    title: string;
    description: string;
};
