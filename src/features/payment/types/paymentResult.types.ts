export type PaymentResultStatus = 'SUCCESS' | 'FAILURE';

export type PaymentResultFlow =
    | 'NORMAL'
    | 'DUTCH_PAY_PRE_AUTH'
    | 'DUTCH_PAY_FINAL';

export type PaymentResultRouteParams = {
    status?: PaymentResultStatus;
    flow?: PaymentResultFlow;
    dutchSessionId?: number;
    selectedUserIds?: number[];
    splitMethod?: 'EQUAL' | 'CUSTOM';
    orderName?: string;
    merchantId?: number;
};
