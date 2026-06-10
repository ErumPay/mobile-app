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
        ? formatRemoteParticipantName(
            response.recipientName,
            response.recipientPhoneSuffix,
            '요청 상대',
        )
        : formatRemoteParticipantName(response.requesterName, undefined, '요청자'),
    expiresAt: response.expiresAt,
    summary: toRemotePaymentRecipientSummary(response),
  };
}

function formatRemoteParticipantName(
  name: string,
  phoneSuffix: string | undefined,
  fallbackName: string,
) {
  const trimmedName = name.trim();
  const displayName =
    !trimmedName || /^사용자\s*\d+$/.test(trimmedName) || trimmedName === '대리자'
      ? fallbackName
      : trimmedName;
  const trimmedPhoneSuffix = phoneSuffix?.trim();

  if (!trimmedPhoneSuffix || /\(\d{4}\)$/.test(displayName)) {
    return displayName;
  }

  return `${displayName}(${trimmedPhoneSuffix})`;
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
