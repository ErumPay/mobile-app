export type PaymentCancelMode = 'REQUEST' | 'COMPLETE';

export type PaymentCancelRouteParams = {
  mode?: PaymentCancelMode;
  paymentId?: number;
  idempotencyKey?: string;
};

export type PaymentCancelDetail = {
  paymentId: number;
  merchantName: string;
  amount: number;
  paymentDate: string;
  refundDate: string;
};
