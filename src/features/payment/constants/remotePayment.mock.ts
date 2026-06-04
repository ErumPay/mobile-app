import type { RemotePaymentRequestResponse } from '../types/remotePayment.types';

export const mockRemotePaymentRequestResponse: RemotePaymentRequestResponse = {
  remotePaymentRequestId: 'remote-1-friend-1',
  paymentId: 1,
  merchantName: '롯데시네마 홍대입구점',
  amount: 45000,
  requesterName: '나이룸',
  recipientUserId: 'friend-1',
  recipientName: '김민수',
  recipientPhoneSuffix: '1111',
  status: 'REQUESTED',
};

export function getMockRemotePaymentRequestResponse(
  remotePaymentRequestId: string,
): RemotePaymentRequestResponse {
  return {
    ...mockRemotePaymentRequestResponse,
    remotePaymentRequestId,
  };
}
