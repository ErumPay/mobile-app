import type { PaymentRequestSummary } from './paymentMethod.types';

export type RemotePaymentRequestStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'COMPLETED'
  | 'REJECTED';

export type RemotePaymentProgressRole = 'REQUESTER' | 'RECIPIENT';

export type RemotePaymentRequestPayload = {
  paymentId: number;
  remoteRequestId?: number;
  merchantName: string;
  amount: number;
  recipientUserId: string;
  recipientName: string;
  recipientPhoneSuffix: string;
  orderName?: string;
  merchantId?: number;
  idempotencyKey?: string;
};

export type RemotePaymentRequestResponse = {
  remotePaymentRequestId: string;
  paymentId: number;
  payerPaymentId?: number;
  merchantName: string;
  amount: number;
  requesterUserId?: string;
  requesterName: string;
  recipientUserId: string;
  recipientName: string;
  recipientPhoneSuffix: string;
  status: RemotePaymentRequestStatus;
  expiresAt?: string;
};

export type RemotePaymentProgress = {
  requestId: string;
  role: RemotePaymentProgressRole;
  status: RemotePaymentRequestStatus;
  participantName: string;
  expiresAt?: string;
  summary: PaymentRequestSummary;
};
