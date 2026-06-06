import type { PaymentCardFlowType } from './paymentCard.types';

export type PaymentPinMode = 'PAYMENT_INPUT' | 'REGISTER' | 'CONFIRM';

type PaymentInputPinRouteParams = {
  mode: 'PAYMENT_INPUT';
  paymentId: number;
  cardId: number;
  amount: number;
  flow: PaymentCardFlowType;
  idempotencyKey?: string;
  remoteRequestId?: number;
  dutchSessionId?: number;
  selectedUserIds?: number[];
  splitMethod?: 'EQUAL' | 'CUSTOM';
  orderName?: string;
  merchantId?: number;
};

type PaymentRegisterPinRouteParams = {
  mode: 'REGISTER';
};

type PaymentConfirmPinRouteParams = {
  mode: 'CONFIRM';
  firstPin: string;
};

export type PaymentPinRouteParams =
  | PaymentInputPinRouteParams
  | PaymentRegisterPinRouteParams
  | PaymentConfirmPinRouteParams;

export type LegacyPaymentPinRouteParams = {
  mode?: PaymentPinMode;
  firstPin?: string;
  paymentId?: number;
  cardId?: number;
  amount?: number;
  flow?: PaymentCardFlowType;
  idempotencyKey?: string;
  remoteRequestId?: number;
  dutchSessionId?: number;
  selectedUserIds?: number[];
  splitMethod?: 'EQUAL' | 'CUSTOM';
  orderName?: string;
  merchantId?: number;
};
