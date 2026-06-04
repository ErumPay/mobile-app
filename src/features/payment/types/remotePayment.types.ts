import type { PaymentRequestSummary } from './paymentMethod.types';

export type RemotePaymentRequestStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'COMPLETED'
  | 'REJECTED';

export type RemotePaymentProgressRole = 'REQUESTER' | 'RECIPIENT';

export type RemotePaymentRequestPayload = {
  paymentId: number;
  merchantName: string;
  amount: number;
  recipientUserId: string;
  recipientName: string;
  recipientPhoneSuffix: string;
};

export type RemotePaymentRequestResponse = {
  remotePaymentRequestId: string;
  paymentId: number;
  merchantName: string;
  amount: number;
  requesterName: string;
  recipientUserId: string;
  recipientName: string;
  recipientPhoneSuffix: string;
  status: RemotePaymentRequestStatus;
};

export type RemotePaymentProgress = {
  requestId: string;
  role: RemotePaymentProgressRole;
  status: RemotePaymentRequestStatus;
  participantName: string;
  summary: PaymentRequestSummary;
};
