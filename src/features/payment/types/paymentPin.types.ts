import type { PaymentCardFlowType } from './paymentCard.types';

export type PaymentPinMode = 'PAYMENT_INPUT' | 'REGISTER' | 'CONFIRM';
export type PaymentPinSetupFlow = 'SIGNUP' | 'PIN_RESET';

type PaymentInputPinRouteParams = {
  mode: 'PAYMENT_INPUT';
  paymentId: number;
  cardId: number;
  amount: number;
  strategyType: string;
  cards: {
    cardId: number;
    amount: number;
  }[];
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
  flow?: PaymentPinSetupFlow;
  verificationId?: number;
};

type PaymentConfirmPinRouteParams = {
  mode: 'CONFIRM';
  firstPin: string;
  flow?: PaymentPinSetupFlow;
  verificationId?: number;
};

export type PaymentPinRouteParams =
  | PaymentInputPinRouteParams
  | PaymentRegisterPinRouteParams
  | PaymentConfirmPinRouteParams;

export type LegacyPaymentPinRouteParams = {
  mode?: PaymentPinMode;
  firstPin?: string;
  setupFlow?: PaymentPinSetupFlow;
  verificationId?: number;
  paymentId?: number;
  cardId?: number;
  amount?: number;
  strategyType?: string;
  cards?: {
    cardId: number;
    amount: number;
  }[];
  flow?: PaymentCardFlowType;
  idempotencyKey?: string;
  remoteRequestId?: number;
  dutchSessionId?: number;
  selectedUserIds?: number[];
  splitMethod?: 'EQUAL' | 'CUSTOM';
  orderName?: string;
  merchantId?: number;
};
