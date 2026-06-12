import type {
  RemotePaymentRequestPayload,
  RemotePaymentRequestResponse,
  RemotePaymentRequestStatus,
} from '../types/remotePayment.types';
import {
  getPaymentUserId,
  PAYMENT_API_BASE_URL,
} from './paymentApiConfig';

type RemotePayBackendResponse = {
  request_id: number;
  requester_user_id: number;
  target_user_id?: number | null;
  payment_id?: number | null;
  source_payment_id?: number | null;
  payer_payment_id?: number | null;
  amount: number;
  description?: string | null;
  status: 'DRAFT' | 'PENDING' | 'COMPLETED' | 'REJECTED_BY_PAYER' | 'CANCELLED_BY_REQUESTER' | 'EXPIRED';
  expires_at?: string | null;
};

type PrepareRemoteResponse = {
  paymentId: number;
  remoteRequestId?: number;
  amount: number;
};

type RemotePaySsePayload = {
  event_type?: string;
  request_id?: number;
  request?: RemotePayBackendResponse;
};

type PaymentApiErrorResponse = {
  reason?: string;
  message?: string;
};

type SseEvent = {
  eventName: string;
  data: string;
};

export type RemotePaymentRequestStreamEvent = {
  eventName: 'connected' | 'request-updated' | string;
  eventType: string;
  requestId: string;
  request: RemotePaymentRequestResponse;
};

export type RemotePaymentRequestStreamHandlers = {
  onConnected?: (event: RemotePaymentRequestStreamEvent) => void;
  onRequestUpdated?: (event: RemotePaymentRequestStreamEvent) => void;
  onError?: (error: Error) => void;
};

const REMOTE_PAY_REQUESTS_URL = `${PAYMENT_API_BASE_URL}/api/v1/remote-pay/requests`;
const REMOTE_PAY_EXPIRE_BATCH_URL = `${PAYMENT_API_BASE_URL}/internal/v1/remote-pay/expire-batch`;
const PAYMENT_PREPARE_URL = `${PAYMENT_API_BASE_URL}/api/v1/payment/prepare`;
const REMOTE_PAY_API_TIMEOUT_MS = 8000;

function toRemoteStatus(status: RemotePayBackendResponse['status']): RemotePaymentRequestStatus {
  if (status === 'COMPLETED') {
    return 'COMPLETED';
  }

  if (status === 'REJECTED_BY_PAYER' || status === 'CANCELLED_BY_REQUESTER' || status === 'EXPIRED') {
    return 'REJECTED';
  }

  return 'REQUESTED';
}

async function parsePaymentApiError(response: Response): Promise<PaymentApiErrorResponse> {
  try {
    return response.json();
  } catch {
    return {};
  }
}

async function fetchRemotePay(input: RequestInfo, init?: RequestInit) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REMOTE_PAY_API_TIMEOUT_MS);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function toRemotePaymentResponse(
  response: RemotePayBackendResponse,
  fallback?: Partial<RemotePaymentRequestResponse>,
): RemotePaymentRequestResponse {
  return {
    remotePaymentRequestId: String(response.request_id),
    paymentId: response.source_payment_id ?? response.payment_id ?? fallback?.paymentId ?? response.request_id,
    payerPaymentId: response.payer_payment_id ?? response.payment_id ?? undefined,
    merchantName: response.description ?? fallback?.merchantName ?? '원격결제',
    amount: response.amount,
    requesterUserId: String(response.requester_user_id),
    requesterName: fallback?.requesterName ?? `사용자 ${response.requester_user_id}`,
    recipientUserId: String(response.target_user_id ?? fallback?.recipientUserId ?? ''),
    recipientName: fallback?.recipientName ?? (response.target_user_id ? `사용자 ${response.target_user_id}` : '대리자'),
    recipientPhoneSuffix: fallback?.recipientPhoneSuffix ?? '',
    status: toRemoteStatus(response.status),
    expiresAt: response.expires_at ?? undefined,
  };
}

function parseSseEvent(rawEvent: string): SseEvent | null {
  const lines = rawEvent.split(/\r?\n/);
  const eventName =
    lines
      .find((line) => line.startsWith('event:'))
      ?.replace('event:', '')
      .trim() ?? '';
  const data = lines
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.replace('data:', '').trim())
    .join('\n');

  if (!eventName || !data) {
    return null;
  }

  return {
    eventName,
    data,
  };
}

function toRemotePaymentStreamEvent(
  eventName: string,
  payload: RemotePaySsePayload,
): RemotePaymentRequestStreamEvent | null {
  if (!payload.request) {
    return null;
  }

  return {
    eventName,
    eventType: payload.event_type ?? '',
    requestId: String(payload.request_id ?? payload.request.request_id),
    request: toRemotePaymentResponse(payload.request),
  };
}

async function prepareRemoteDraft(
  payload: RemotePaymentRequestPayload,
): Promise<PrepareRemoteResponse> {
  const response = await fetchRemotePay(PAYMENT_PREPARE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': getPaymentUserId(),
      'Idempotency-Key': payload.idempotencyKey ?? `remote-source-${payload.paymentId}`,
    },
    body: JSON.stringify({
      paymentId: payload.paymentId,
      amount: payload.amount,
      paymentType: 'REMOTE',
    }),
  });

  if (!response.ok) {
    const error = await parsePaymentApiError(response);
    throw new Error(error.message ?? '원격결제 요청 준비에 실패했습니다.');
  }

  return response.json();
}

export function subscribeRemotePaymentRequestStream(
  remoteRequestId: number | string,
  handlers: RemotePaymentRequestStreamHandlers,
): () => void {
  const xhr = new XMLHttpRequest();
  let lastReadIndex = 0;
  let buffer = '';
  let closed = false;
  let errorEmitted = false;

  const emitError = (error: Error) => {
    if (closed || errorEmitted) {
      return;
    }

    errorEmitted = true;
    handlers.onError?.(error);
  };

  const cleanup = () => {
    xhr.onreadystatechange = null;
    xhr.onprogress = null;
    xhr.onerror = null;
    xhr.onloadend = null;
  };

  const processRawEvent = (rawEvent: string) => {
    const event = parseSseEvent(rawEvent);

    if (!event) {
      return;
    }

    try {
      const payload = JSON.parse(event.data) as RemotePaySsePayload;
      const streamEvent = toRemotePaymentStreamEvent(event.eventName, payload);

      if (!streamEvent) {
        return;
      }

      if (event.eventName === 'connected') {
        handlers.onConnected?.(streamEvent);
        return;
      }

      handlers.onRequestUpdated?.(streamEvent);
    } catch {
      emitError(new Error('원격결제 상태 이벤트를 해석하지 못했습니다.'));
    }
  };

  const readAvailableEvents = () => {
    const nextChunk = xhr.responseText.slice(lastReadIndex);
    lastReadIndex = xhr.responseText.length;
    buffer += nextChunk;

    const rawEvents = buffer.split(/\r?\n\r?\n/);
    buffer = rawEvents.pop() ?? '';
    rawEvents.forEach(processRawEvent);
  };

  xhr.open('GET', `${REMOTE_PAY_REQUESTS_URL}/${remoteRequestId}/stream`);
  xhr.setRequestHeader('Accept', 'text/event-stream');
  xhr.setRequestHeader('X-User-Id', getPaymentUserId());
  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED && xhr.status >= 400) {
      emitError(new Error('원격결제 상태 스트림 연결에 실패했습니다.'));
      cleanup();
      xhr.abort();
    }
  };
  xhr.onprogress = readAvailableEvents;
  xhr.onerror = () => {
    emitError(new Error('원격결제 상태 스트림 연결이 끊겼습니다.'));
  };
  xhr.onloadend = () => {
    if (!closed && !errorEmitted && xhr.status >= 400) {
      emitError(new Error('원격결제 상태 스트림 연결이 종료되었습니다.'));
    }
  };
  xhr.send();

  return () => {
    closed = true;
    cleanup();
    xhr.abort();
  };
}

export async function requestRemotePayment(
  payload: RemotePaymentRequestPayload,
): Promise<RemotePaymentRequestResponse> {
  const prepareResponse = payload.remoteRequestId
    ? {
        paymentId: payload.paymentId,
        remoteRequestId: payload.remoteRequestId,
        amount: payload.amount,
      }
    : await prepareRemoteDraft(payload);

  if (!prepareResponse.remoteRequestId) {
    throw new Error('원격결제 요청 ID가 없습니다.');
  }

  const response = await fetchRemotePay(
    `${REMOTE_PAY_REQUESTS_URL}/${prepareResponse.remoteRequestId}/target`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': getPaymentUserId(),
      },
      body: JSON.stringify({
        target_user_id: Number(payload.recipientUserId),
      }),
    },
  );

  if (!response.ok) {
    const error = await parsePaymentApiError(response);
    throw new Error(error.message ?? '원격결제 요청 전송에 실패했습니다.');
  }

  const remoteResponse: RemotePayBackendResponse = await response.json();

  return toRemotePaymentResponse(remoteResponse, {
    paymentId: prepareResponse.paymentId,
    merchantName: payload.merchantName,
    requesterName: '나',
    recipientUserId: payload.recipientUserId,
    recipientName: payload.recipientName,
    recipientPhoneSuffix: payload.recipientPhoneSuffix,
  });
}

export async function getRemotePaymentRequest(
  remoteRequestId: number | string,
): Promise<RemotePaymentRequestResponse> {
  const response = await fetchRemotePay(`${REMOTE_PAY_REQUESTS_URL}/${remoteRequestId}`, {
    headers: {
      'X-User-Id': getPaymentUserId(),
    },
  });

  if (!response.ok) {
    const error = await parsePaymentApiError(response);
    throw new Error(error.message ?? '원격결제 요청 정보를 불러오지 못했습니다.');
  }

  return toRemotePaymentResponse(await response.json());
}

export async function getActiveRemotePaymentRequests(): Promise<RemotePaymentRequestResponse[]> {
  await expireRemotePaymentRequests().catch(() => undefined);

  const response = await fetchRemotePay(`${REMOTE_PAY_REQUESTS_URL}/active`, {
    headers: {
      'X-User-Id': getPaymentUserId(),
    },
  });

  if (!response.ok) {
    const error = await parsePaymentApiError(response);
    throw new Error(error.message ?? '진행 중인 원격결제 요청을 불러오지 못했습니다.');
  }

  const requests: RemotePayBackendResponse[] = await response.json();

  return requests
    .map((request) => toRemotePaymentResponse(request))
    .filter((request) => request.recipientUserId);
}

export async function expireRemotePaymentRequests(): Promise<void> {
  const response = await fetchRemotePay(REMOTE_PAY_EXPIRE_BATCH_URL, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await parsePaymentApiError(response);
    throw new Error(error.message ?? '원격결제 만료 처리에 실패했습니다.');
  }

  await response.json().catch(() => null);
}

export async function rejectRemotePaymentRequest(
  remoteRequestId: number | string,
  rejectReason?: string,
): Promise<RemotePaymentRequestResponse> {
  const response = await fetchRemotePay(`${REMOTE_PAY_REQUESTS_URL}/${remoteRequestId}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': getPaymentUserId(),
    },
    body: JSON.stringify({
      reject_reason: rejectReason ?? '사용자가 거절했습니다.',
    }),
  });

  if (!response.ok) {
    const error = await parsePaymentApiError(response);
    throw new Error(error.message ?? '원격결제 요청 거절에 실패했습니다.');
  }

  return toRemotePaymentResponse(await response.json());
}
