export type PaymentPinMode = 'PAYMENT_INPUT' | 'REGISTER' | 'CONFIRM';

export type PaymentPinRouteParams = {
  mode?: PaymentPinMode;
};
