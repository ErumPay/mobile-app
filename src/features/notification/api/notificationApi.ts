import {
  AuthApiError,
  fetchAuth,
  getAccessTokenForAuthRequest,
  getAuthSessionUserId,
} from '../../auth/api/authApi';
import { NOTIFICATION_API_BASE_URL } from './notificationApiConfig';

export type NotificationItem = {
  notificationId: number;
  type: string;
  title: string;
  content: string;
  paymentId: number | null;
  isRead: boolean;
  channel: string;
  createdAt: string;
  readAt: string | null;
};

export type NotificationResponse = {
  page: number;
  size: number;
  totalCount: number;
  items: NotificationItem[];
};

export type FetchNotificationsParams = {
  page: number;
  size: number;
  isRead?: boolean;
};

export type NotificationReadResponse = {
  notificationId: number;
  isRead: boolean;
  readAt: string | null;
};

type NotificationPageResponse = {
  content: NotificationItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

const NOTIFICATION_SCHEMA_SAMPLE_SIZE = 10;

function getNotificationUserId() {
  const sessionUserId = getAuthSessionUserId();

  if (sessionUserId == null) {
    throw new Error('로그인 사용자 정보가 없습니다.');
  }

  return String(sessionUserId);
}

function isNotificationReadResponse(value: unknown): value is NotificationReadResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.notificationId === 'number' &&
    typeof record.isRead === 'boolean' &&
    (typeof record.readAt === 'string' || record.readAt === null)
  );
}

function isNotificationItem(value: unknown): value is NotificationItem {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.notificationId === 'number' &&
    typeof record.type === 'string' &&
    typeof record.title === 'string' &&
    typeof record.content === 'string' &&
    (typeof record.paymentId === 'number' || record.paymentId === null) &&
    typeof record.isRead === 'boolean' &&
    typeof record.channel === 'string' &&
    typeof record.createdAt === 'string' &&
    (typeof record.readAt === 'string' || record.readAt === null)
  );
}

function isNotificationPageResponse(value: unknown): value is NotificationPageResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;
  const contentSample = Array.isArray(record.content)
    ? record.content.slice(0, NOTIFICATION_SCHEMA_SAMPLE_SIZE)
    : null;

  return (
    typeof record.page === 'number' &&
    typeof record.size === 'number' &&
    typeof record.totalElements === 'number' &&
    typeof record.totalPages === 'number' &&
    typeof record.first === 'boolean' &&
    typeof record.last === 'boolean' &&
    Array.isArray(record.content) &&
    contentSample !== null &&
    contentSample.every(isNotificationItem)
  );
}

export async function fetchNotifications(params: FetchNotificationsParams): Promise<NotificationResponse> {
  if (params.page < 0 || params.size <= 0 || params.size > 100) {
    throw new Error('Invalid pagination parameters');
  }

  const accessToken = await getAccessTokenForAuthRequest();
  const userId = getNotificationUserId();

  const queryEntries = [
    `page=${encodeURIComponent(String(params.page))}`,
    `size=${encodeURIComponent(String(params.size))}`,
  ];

  if (typeof params.isRead === 'boolean') {
    queryEntries.push(`isRead=${encodeURIComponent(String(params.isRead))}`);
  }

  const requestUrl = `${NOTIFICATION_API_BASE_URL}/api/v1/notifications?${queryEntries.join('&')}`;

  const response = await fetchAuth(requestUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-User-Id': userId,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new AuthApiError(error?.message ?? '알림 목록을 불러오지 못했습니다.', response.status);
  }

  const data: unknown = await response.json();

  if (!isNotificationPageResponse(data)) {
    throw new Error('Invalid notifications response schema.');
  }

  const normalizedResponse: NotificationResponse = {
    page: data.page,
    size: data.size,
    totalCount: data.totalElements,
    items: data.content,
  };

  return normalizedResponse;
}

export async function readNotification(notificationId: number): Promise<NotificationReadResponse> {
  const accessToken = await getAccessTokenForAuthRequest();
  const userId = getNotificationUserId();
  const requestUrl = `${NOTIFICATION_API_BASE_URL}/api/v1/notifications/${notificationId}/read`;

  const response = await fetchAuth(requestUrl, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-User-Id': userId,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new AuthApiError(error?.message ?? '알림 읽음 처리에 실패했습니다.', response.status);
  }

  const data: unknown = await response.json();

  if (!isNotificationReadResponse(data)) {
    throw new Error('Invalid read notification response schema.');
  }

  return data;
}
