import * as SecureStore from 'expo-secure-store';

const CANCELLED_DUTCH_PAY_SESSION_IDS_KEY =
  'erumpay.cancelledDutchPaySessionIds';

async function getCancelledSessionIds() {
  const storedValue = await SecureStore.getItemAsync(
    CANCELLED_DUTCH_PAY_SESSION_IDS_KEY,
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

async function setCancelledSessionIds(sessionIds: number[]) {
  await SecureStore.setItemAsync(
    CANCELLED_DUTCH_PAY_SESSION_IDS_KEY,
    JSON.stringify(Array.from(new Set(sessionIds))),
  );
}

export async function addCancelledDutchPaySession(sessionId: number) {
  const sessionIds = await getCancelledSessionIds();

  await setCancelledSessionIds([...sessionIds, sessionId]);
}

export async function removeCancelledDutchPaySession(sessionId: number) {
  const sessionIds = await getCancelledSessionIds();

  await setCancelledSessionIds(
    sessionIds.filter((storedSessionId) => storedSessionId !== sessionId),
  );
}

export async function getCancelledDutchPaySessionIdSet() {
  const sessionIds = await getCancelledSessionIds();

  return new Set(sessionIds);
}
