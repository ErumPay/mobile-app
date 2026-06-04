export type OfflinePaymentQrRequestPayload = {
    merchant_id: number;
    amount: number;
    order_name: string;
    channel_type: 'OFFLINE';
};

export type OfflinePaymentQrRouteParams = {
    merchantId?: number;
    amount?: number;
    orderName?: string;
};
