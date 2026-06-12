import * as SecureStore from 'expo-secure-store';

const CONFIRMED_DUTCH_PAY_AMOUNT_SESSION_IDS_KEY =
  'erumpay.confirmedDutchPayAmountSessionIds';

async function getConfirmedAmountSessionIds() {
  const storedValue = await SecureStore.getItemAsync(
    CONFIRMED_DUTCH_PAY_AMOUNT_SESSION_IDS_KEY,
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

async function setConfirmedAmountSessionIds(sessionIds: number[]) {
  await SecureStore.setItemAsync(
    CONFIRMED_DUTCH_PAY_AMOUNT_SESSION_IDS_KEY,
    JSON.stringify(Array.from(new Set(sessionIds))),
  );
}

export async function addConfirmedDutchPayAmountSession(sessionId: number) {
  const sessionIds = await getConfirmedAmountSessionIds();

  await setConfirmedAmountSessionIds([...sessionIds, sessionId]);
}

export async function removeConfirmedDutchPayAmountSession(sessionId: number) {
  const sessionIds = await getConfirmedAmountSessionIds();

  await setConfirmedAmountSessionIds(
    sessionIds.filter((storedSessionId) => storedSessionId !== sessionId),
  );
}

export async function getConfirmedDutchPayAmountSessionIdSet() {
  const sessionIds = await getConfirmedAmountSessionIds();

  return new Set(sessionIds);
}
