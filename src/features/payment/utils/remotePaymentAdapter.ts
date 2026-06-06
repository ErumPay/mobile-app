import type { PaymentProgressVariant } from '../../main/components/PaymentProgressCard';
import type { PaymentRequestSummary } from '../types/paymentMethod.types';
import type {
  RemotePaymentProgress,
  RemotePaymentProgressRole,
  RemotePaymentRequestResponse,
  RemotePaymentRequestStatus,
} from '../types/remotePayment.types';

export function toRemotePaymentRecipientSummary(
  response: RemotePaymentRequestResponse,
): PaymentRequestSummary {
  return {
    paymentId: response.paymentId,
    remoteRequestId: Number(response.remotePaymentRequestId),
    merchantName: response.merchantName,
    amount: response.amount,
    type: 'REMOTE_RECIPIENT',
    requesterName: response.requesterName,
  };
}

export function toRemotePaymentProgress({
  response,
  role,
}: {
  response: RemotePaymentRequestResponse;
  role: RemotePaymentProgressRole;
}): RemotePaymentProgress {
  return {
    requestId: response.remotePaymentRequestId,
    role,
    status: response.status,
    participantName:
      role === 'REQUESTER'
        ? `${response.recipientName}(${response.recipientPhoneSuffix})`
        : response.requesterName,
    summary: toRemotePaymentRecipientSummary(response),
  };
}

export function toRemotePaymentProgressVariant({
  role,
  status,
}: {
  role: RemotePaymentProgressRole;
  status: RemotePaymentRequestStatus;
}): PaymentProgressVariant {
  if (role === 'REQUESTER') {
    if (status === 'ACCEPTED') {
      return 'REMOTE_OUTGOING_REQUEST_ACCEPTED';
    }

    if (status === 'COMPLETED') {
      return 'REMOTE_OUTGOING_PAYMENT_COMPLETED';
    }

    if (status === 'REJECTED') {
      return 'REMOTE_OUTGOING_REQUEST_REJECTED';
    }

    return 'REMOTE_OUTGOING_REQUEST_SENT';
  }

  if (status === 'ACCEPTED') {
    return 'REMOTE_INCOMING_REQUEST_ACCEPTED';
  }

  if (status === 'COMPLETED') {
    return 'REMOTE_INCOMING_PAYMENT_COMPLETED';
  }

  if (status === 'REJECTED') {
    return 'REMOTE_INCOMING_REQUEST_REJECTED';
  }

  return 'REMOTE_INCOMING_REQUEST_RECEIVED';
}
