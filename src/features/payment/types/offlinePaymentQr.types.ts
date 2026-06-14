export type OfflinePaymentQrRequestPayload = {
    merchant_id: number;
    amount: number;
    channel_type: 'ONLINE' | 'OFFLINE';
};

export type OfflinePaymentQrRouteParams = {
    merchantId?: number;
    amount?: number;
    merchantName?: string;
    channelType?: 'ONLINE' | 'OFFLINE' | string;
};
