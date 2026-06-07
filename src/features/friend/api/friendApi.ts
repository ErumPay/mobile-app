import { AUTH_API_BASE_URL } from '../../auth/api/authApiConfig';
import { AuthApiError, fetchAuth, getAccessTokenForAuthRequest } from '../../auth/api/authApi';

export type AuthFriendResponse = {
  relationId: number;
  userId: number;
  name: string;
  phoneLastFour: string;
  isFavorite: boolean;
};

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
  const accessToken = await getAccessTokenForAuthRequest(undefined, {
    useExistingDevUser: true,
  });

  console.log('[fetchAuthFriends] request start', {
    url: `${AUTH_API_BASE_URL}/api/v1/friends`,
    hasAccessToken: Boolean(accessToken),
    // tokenPreview: accessToken ? `${accessToken.slice(0, 12)}...` : null,
  });

  const response = await fetchAuth(`${AUTH_API_BASE_URL}/api/v1/friends`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  console.log('[fetchAuthFriends] response received', {
    status: response.status,
    ok: response.ok,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    console.warn('[fetchAuthFriends] request failed', error);
    throw new AuthApiError(error?.message ?? '친구 목록을 불러오지 못했습니다.', response.status);
  }

  const data: unknown = await response.json();
  const responseInfo = describeFriendsResponse(data);

  if (!responseInfo.hasFriendsKey || !Array.isArray((data as { friends?: unknown }).friends)) {
    console.warn('[fetchAuthFriends] invalid response schema', responseInfo);
    throw new Error(
      `Invalid friends response schema: bodyType=${responseInfo.bodyType}, keys=${responseInfo.keys.join(',') || '(none)'}, friendsFieldType=${responseInfo.friendsFieldType}`,
    );
  }

  const friends = (data as { friends: AuthFriendResponse[] }).friends;

  // console.log('[fetchAuthFriends] response body', data);
  console.log('[fetchAuthFriends] response body parsed', {
    friendCount: friends.length,
  });

  return friends;
}

// [FE] 다윤 260608 00:00 | 친구 삭제 요청 api
export async function deleteAuthFriend(friendUserId: number): Promise<void> {
  const accessToken = await getAccessTokenForAuthRequest(undefined, {
    useExistingDevUser: true,
  });

  console.log('[deleteAuthFriend] request start', {
    url: `${AUTH_API_BASE_URL}/api/v1/friends/${friendUserId}`,
    hasAccessToken: Boolean(accessToken),
    // friendUserId,
    // tokenPreview: accessToken ? `${accessToken.slice(0, 12)}...` : null,
  });

  const response = await fetchAuth(`${AUTH_API_BASE_URL}/api/v1/friends/${friendUserId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  console.log('[deleteAuthFriend] response received', {
    status: response.status,
    ok: response.ok,
    // friendUserId,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    console.warn('[deleteAuthFriend] request failed', error);
    throw new AuthApiError(error?.message ?? '친구 삭제에 실패했습니다.', response.status);
  }

  const data = await response.json().catch(() => null);
  // console.log('[deleteAuthFriend] response body', data);
}

// [FE] 다윤 260608 00:00 | 친구 즐겨찾기 토글 api
export async function updateAuthFriendFavorite(friendUserId: number, isFavorite: boolean): Promise<void> {
  const accessToken = await getAccessTokenForAuthRequest(undefined, {
    useExistingDevUser: true,
  });

  console.log('[updateAuthFriendFavorite] request start', {
    url: `${AUTH_API_BASE_URL}/api/v1/friends/${friendUserId}/favorite`,
    isFavorite,
    hasAccessToken: Boolean(accessToken),
    // friendUserId,
    // tokenPreview: accessToken ? `${accessToken.slice(0, 12)}...` : null,
  });

  const response = await fetchAuth(`${AUTH_API_BASE_URL}/api/v1/friends/${friendUserId}/favorite`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ isFavorite }),
  });

  console.log('[updateAuthFriendFavorite] response received', {
    status: response.status,
    ok: response.ok,
    isFavorite,
    // friendUserId,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    console.warn('[updateAuthFriendFavorite] request failed', error);
    throw new AuthApiError(error?.message ?? '즐겨찾기 설정에 실패했습니다.', response.status);
  }

  const data = await response.json().catch(() => null);
  // console.log('[updateAuthFriendFavorite] response body', data);
}
