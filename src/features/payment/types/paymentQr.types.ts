export type PaymentQrValidateCode = 'VALID' | 'INVALID';

export type PaymentQrChannelType =
    | 'OFFLINE'
    | 'ONLINE'
    | 'DUTCH_PAY_PARTICIPANT'
    | 'REMOTE_RECIPIENT';

export type PaymentQrValidateResponse = {
    paymentId: number;
    code: PaymentQrValidateCode;
    amount: number;
    merchant_name: string;
    channel_type: PaymentQrChannelType;
};
