import { AUTH_API_BASE_URL } from '../../auth/api/authApiConfig';
import { AuthApiError, fetchAuth, getAccessTokenForAuthRequest } from '../../auth/api/authApi';

export type AuthFriendResponse = {
  relationId: number;
  userId: number;
  name: string;
  phoneLastFour: string;
  isFavorite: boolean;
};

export type AuthFriendRequestResponse = {
  relationId: number;
  fromUserId: number;
  name: string;
  phoneLastFour: string;
  createdAt: string;
};

export type AuthFriendInviteLinkResponse = {
  inviteToken: string;
  inviteUrl: string;
  expiresAt: string;
};

async function getFriendAccessToken() {
  return getAccessTokenForAuthRequest();
}

function describeFriendsResponse(data: unknown) {
  if (Array.isArray(data)) {
    return {
      bodyType: 'array',
      keys: [],
      hasFriendsKey: false,
      friendsFieldType: 'missing',
    };
  }

  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    const keys = Object.keys(record);
    const friendsValue = record.friends;

    return {
      bodyType: 'object',
      keys,
      hasFriendsKey: Object.prototype.hasOwnProperty.call(record, 'friends'),
      friendsFieldType: Array.isArray(friendsValue) ? 'array' : typeof friendsValue,
    };
  }

  return {
    bodyType: typeof data,
    keys: [],
    hasFriendsKey: false,
    friendsFieldType: 'missing',
  };
}

// [FE] 다윤 260608 00:00 | 친구 목록 조회 api
export async function fetchAuthFriends(): Promise<AuthFriendResponse[]> {
  const accessToken = await getFriendAccessToken();

  const response = await fetchAuth(`${AUTH_API_BASE_URL}/api/v1/friends`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new AuthApiError(error?.message ?? '친구 목록을 불러오지 못했습니다.', response.status);
  }

  const data: unknown = await response.json();
  const responseInfo = describeFriendsResponse(data);

  if (!responseInfo.hasFriendsKey || !Array.isArray((data as { friends?: unknown }).friends)) {
    throw new Error(
      `Invalid friends response schema: bodyType=${responseInfo.bodyType}, keys=${responseInfo.keys.join(',') || '(none)'}, friendsFieldType=${responseInfo.friendsFieldType}`,
    );
  }

  const friends = (data as { friends: AuthFriendResponse[] }).friends;

  return friends;
}

// [FE] 다윤 260608 00:00 | 친구 삭제 요청 api
export async function deleteAuthFriend(friendUserId: number): Promise<void> {
  const accessToken = await getFriendAccessToken();

  const response = await fetchAuth(`${AUTH_API_BASE_URL}/api/v1/friends/${friendUserId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new AuthApiError(error?.message ?? '친구 삭제에 실패했습니다.', response.status);
  }

  await response.json().catch(() => null);
}

// [FE] 다윤 260608 00:00 | 친구 즐겨찾기 토글 api
export async function updateAuthFriendFavorite(friendUserId: number, isFavorite: boolean): Promise<void> {
  const accessToken = await getFriendAccessToken();

  const response = await fetchAuth(`${AUTH_API_BASE_URL}/api/v1/friends/${friendUserId}/favorite`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ isFavorite }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new AuthApiError(error?.message ?? '즐겨찾기 설정에 실패했습니다.', response.status);
  }

  await response.json().catch(() => null);
}

export async function fetchReceivedFriendRequests(): Promise<AuthFriendRequestResponse[]> {
  const accessToken = await getFriendAccessToken();

  const response = await fetchAuth(`${AUTH_API_BASE_URL}/api/v1/friends/requests/received`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new AuthApiError(error?.message ?? '받은 친구 요청을 불러오지 못했습니다.', response.status);
  }

  const data: unknown = await response.json();

  if (!data || typeof data !== 'object' || !Array.isArray((data as { requests?: unknown }).requests)) {
    throw new Error('Invalid friend requests response schema');
  }

  return (data as { requests: AuthFriendRequestResponse[] }).requests;
}

export async function acceptFriendRequest(relationId: number): Promise<void> {
  const accessToken = await getFriendAccessToken();

  const response = await fetchAuth(`${AUTH_API_BASE_URL}/api/v1/friends/requests/${relationId}/accept`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new AuthApiError(error?.message ?? '친구 요청 수락에 실패했습니다.', response.status);
  }

  await response.json().catch(() => null);
}

export async function rejectFriendRequest(relationId: number): Promise<void> {
  const accessToken = await getFriendAccessToken();

  const response = await fetchAuth(`${AUTH_API_BASE_URL}/api/v1/friends/requests/${relationId}/reject`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new AuthApiError(error?.message ?? '친구 요청 거절에 실패했습니다.', response.status);
  }

  await response.json().catch(() => null);
}

export async function sendFriendRequest(friendUserId: number): Promise<void> {
  const accessToken = await getFriendAccessToken();

  const response = await fetchAuth(`${AUTH_API_BASE_URL}/api/v1/friends/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      friendUserId,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new AuthApiError(error?.message ?? '친구 요청에 실패했습니다.', response.status);
  }

  await response.json().catch(() => null);
}

export async function createFriendInviteLink(): Promise<AuthFriendInviteLinkResponse> {
  const accessToken = await getFriendAccessToken();

  const response = await fetchAuth(`${AUTH_API_BASE_URL}/api/v1/friends/invite/link`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new AuthApiError(error?.message ?? '친구 초대 링크 생성에 실패했습니다.', response.status);
  }

  return response.json();
}

export async function acceptFriendInviteLink(inviteToken: string): Promise<void> {
  const accessToken = await getFriendAccessToken();
  const encodedInviteToken = encodeURIComponent(inviteToken);
  const requestUrl = `${AUTH_API_BASE_URL}/api/v1/friends/invite/${encodedInviteToken}`;

  const response = await fetchAuth(requestUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new AuthApiError(error?.message ?? '친구 초대 링크 수락에 실패했습니다.', response.status);
  }

  await response.json().catch(() => null);
}
