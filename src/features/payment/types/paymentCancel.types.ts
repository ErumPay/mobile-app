export type PaymentCancelMode = 'REQUEST' | 'COMPLETE';

export type PaymentCancelRouteParams = {
  mode?: PaymentCancelMode;
};

export type PaymentCancelDetail = {
  merchantName: string;
  amount: number;
  paymentDate: string;
  refundDate: string;
};
