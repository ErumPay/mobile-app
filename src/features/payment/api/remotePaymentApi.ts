import type {
  RemotePaymentRequestPayload,
  RemotePaymentRequestResponse,
} from '../types/remotePayment.types';

const MOCK_REQUESTER_NAME = '나이룸';

export async function requestRemotePayment(
  payload: RemotePaymentRequestPayload,
): Promise<RemotePaymentRequestResponse> {
  await new Promise<void>((resolve) => {
    setTimeout(() => resolve(), 350);
  });

  return {
    ...payload,
    requesterName: MOCK_REQUESTER_NAME,
    remotePaymentRequestId: `remote-${payload.paymentId}-${payload.recipientUserId}`,
    status: 'REQUESTED',
  };
}
