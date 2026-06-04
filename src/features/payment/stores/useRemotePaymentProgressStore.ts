import { create } from 'zustand';

import type { PaymentRequestSummary } from '../types/paymentMethod.types';
import type {
  RemotePaymentProgress,
  RemotePaymentRequestResponse,
  RemotePaymentRequestStatus,
} from '../types/remotePayment.types';
import {
  toRemotePaymentProgress,
  toRemotePaymentProgressVariant,
} from '../utils/remotePaymentAdapter';

type RemotePaymentProgressState = {
  progress: RemotePaymentProgress | null;
  setRequesterProgress: (response: RemotePaymentRequestResponse) => void;
  setRecipientProgress: (response: RemotePaymentRequestResponse) => void;
  acceptRequest: () => void;
  rejectRequest: () => void;
  completeRequest: () => void;
  clearProgress: () => void;
  getProgressVariant: () =>
    | ReturnType<typeof toRemotePaymentProgressVariant>
    | null;
  getRecipientSummary: () => PaymentRequestSummary | null;
};

export const useRemotePaymentProgressStore =
  create<RemotePaymentProgressState>((set, get) => ({
    progress: null,

    setRequesterProgress: (response) =>
      set({
        progress: toRemotePaymentProgress({
          response,
          role: 'REQUESTER',
        }),
      }),

    setRecipientProgress: (response) =>
      set({
        progress: toRemotePaymentProgress({
          response,
          role: 'RECIPIENT',
        }),
      }),

    acceptRequest: () => setRemoteProgressStatus(set, get, 'ACCEPTED'),

    rejectRequest: () => setRemoteProgressStatus(set, get, 'REJECTED'),

    completeRequest: () => setRemoteProgressStatus(set, get, 'COMPLETED'),

    clearProgress: () => set({ progress: null }),

    getProgressVariant: () => {
      const progress = get().progress;

      if (!progress) {
        return null;
      }

      return toRemotePaymentProgressVariant({
        role: progress.role,
        status: progress.status,
      });
    },

    getRecipientSummary: () => {
      const progress = get().progress;

      if (
        !progress ||
        progress.role !== 'RECIPIENT' ||
        !['REQUESTED', 'ACCEPTED'].includes(progress.status)
      ) {
        return null;
      }

      return progress.summary;
    },
  }));

function setRemoteProgressStatus(
  set: (state: Partial<RemotePaymentProgressState>) => void,
  get: () => RemotePaymentProgressState,
  status: RemotePaymentRequestStatus,
) {
  const progress = get().progress;

  if (!progress) {
    return;
  }

  if (!canTransitionRemoteProgress(progress.status, status)) {
    return;
  }

  set({
    progress: {
      ...progress,
      status,
    },
  });
}

function canTransitionRemoteProgress(
  currentStatus: RemotePaymentRequestStatus,
  nextStatus: RemotePaymentRequestStatus,
) {
  if (currentStatus === 'COMPLETED' || currentStatus === 'REJECTED') {
    return false;
  }

  if (nextStatus === 'ACCEPTED' || nextStatus === 'REJECTED') {
    return currentStatus === 'REQUESTED';
  }

  if (nextStatus === 'COMPLETED') {
    return currentStatus === 'ACCEPTED';
  }

  return false;
}
