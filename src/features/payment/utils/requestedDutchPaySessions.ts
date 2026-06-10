import * as SecureStore from 'expo-secure-store';

const REQUESTED_DUTCH_PAY_SESSION_IDS_KEY =
  'erumpay.requestedDutchPaySessionIds';

async function getRequestedSessionIds() {
  const storedValue = await SecureStore.getItemAsync(
    REQUESTED_DUTCH_PAY_SESSION_IDS_KEY,
  );

  if (!storedValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(
      (sessionId): sessionId is number =>
        typeof sessionId === 'number' && Number.isFinite(sessionId),
    );
  } catch {
    return [];
  }
}

async function setRequestedSessionIds(sessionIds: number[]) {
  await SecureStore.setItemAsync(
    REQUESTED_DUTCH_PAY_SESSION_IDS_KEY,
    JSON.stringify(Array.from(new Set(sessionIds))),
  );
}

export async function addRequestedDutchPaySession(sessionId: number) {
  const sessionIds = await getRequestedSessionIds();

  await setRequestedSessionIds([...sessionIds, sessionId]);
}

export async function removeRequestedDutchPaySession(sessionId: number) {
  const sessionIds = await getRequestedSessionIds();

  await setRequestedSessionIds(
    sessionIds.filter((storedSessionId) => storedSessionId !== sessionId),
  );
}

export async function getRequestedDutchPaySessionIdSet() {
  const sessionIds = await getRequestedSessionIds();

  return new Set(sessionIds);
}
