export type PaymentPinMode = 'PAYMENT_INPUT' | 'REGISTER' | 'CONFIRM';

export type PaymentPinRouteParams = {
  mode?: PaymentPinMode;
  paymentId?: number;
  cardId?: number;
  amount?: number;
};
