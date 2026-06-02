import type { PaymentCardFlowType } from './paymentCard.types';

export type PaymentPinMode = 'PAYMENT_INPUT' | 'REGISTER' | 'CONFIRM';

type PaymentInputPinRouteParams = {
  mode: 'PAYMENT_INPUT';
  paymentId: number;
  cardId: number;
  amount: number;
  flow: PaymentCardFlowType;
  idempotencyKey?: string;
};

type PaymentRegisterPinRouteParams = {
  mode: 'REGISTER';
};

type PaymentConfirmPinRouteParams = {
  mode: 'CONFIRM';
};

export type PaymentPinRouteParams =
  | PaymentInputPinRouteParams
  | PaymentRegisterPinRouteParams
  | PaymentConfirmPinRouteParams;

export type LegacyPaymentPinRouteParams = {
  mode?: PaymentPinMode;
  paymentId?: number;
  cardId?: number;
  amount?: number;
  flow?: PaymentCardFlowType;
  idempotencyKey?: string;
};