import type { PaymentCardFlowType } from './paymentCard.types';

export type PaymentResultStatus = 'SUCCESS' | 'FAILURE';

export type PaymentResultFlow =
    | 'NORMAL'
    | 'DUTCH_PAY_PRE_AUTH'
    | 'DUTCH_PAY_FINAL';

export type PaymentResultRouteParams = {
    status?: PaymentResultStatus;
    flow?: PaymentResultFlow;
    failureMessage?: string;
    paymentId?: number | string;
    remoteRequestId?: number | string;
    amount?: number | string;
    retryFlow?: PaymentCardFlowType;
    idempotencyKey?: string;
    dutchSessionId?: number;
    selectedUserIds?: number[];
    splitMethod?: 'EQUAL' | 'CUSTOM';
    orderName?: string;
    merchantId?: number;
};
