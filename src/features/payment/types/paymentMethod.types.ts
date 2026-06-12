export type PaymentRequestType =
    | 'OFFLINE'
    | 'ONLINE'
    | 'DUTCH_PAY_PARTICIPANT'
    | 'REMOTE_RECIPIENT';

type BasePaymentRequestSummary = {
    paymentId: number;
    remoteRequestId?: number;
    merchantName: string;
    amount: number;
    requesterName?: string;
    dutchPayOwnerName?: string;
};

export type PaymentRequestSummary =
    | (BasePaymentRequestSummary & {
        type: Exclude<PaymentRequestType, 'REMOTE_RECIPIENT'>;
        payerPaymentId?: never;
    })
    | (BasePaymentRequestSummary & {
        type: 'REMOTE_RECIPIENT';
        remoteRequestId: number;
        payerPaymentId: number;
    });

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
