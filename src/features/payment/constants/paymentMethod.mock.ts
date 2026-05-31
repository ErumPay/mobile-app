import type { PaymentRequestSummary } from '../types/paymentMethod.types';

/**
 * [fe] 조보름 260529 1315 | 타입 종류 리스름
 * 'OFFLINE'
 * 'ONLINE'
 * 'DUTCH_PAY_PARTICIPANT'
 * 'REMOTE_RECIPIENT'
 * */

export const mockPaymentRequestSummary: PaymentRequestSummary = {
    merchantName: '롯데시네마 홍대입구점',
    amount: 45000,
    type: 'ONLINE',
};

/*
export const mockPaymentRequestSummary: PaymentRequestSummary = {
    merchantName: '롯데시네마 홍대입구점',
    amount: 45000,
    type: 'OFFLINE',
};
*/

/*
export const mockRemoteRecipientPaymentRequestSummary: PaymentRequestSummary = {
    merchantName: '롯데시네마 홍대입구점',
    amount: 45000,
    type: 'REMOTE_RECIPIENT',
    requesterName: '은맹맹',
};
export const mockPaymentRequestSummary =
    mockRemoteRecipientPaymentRequestSummary;
*/

/*
export const mockDutchPayParticipantPaymentRequestSummary: PaymentRequestSummary = {
    merchantName: '롯데시네마 홍대입구점',
    amount: 45000,
    type: 'DUTCH_PAY_PARTICIPANT',
    dutchPayOwnerName: '은맹맹',
};
export const mockPaymentRequestSummary =
    mockDutchPayParticipantPaymentRequestSummary;
*/