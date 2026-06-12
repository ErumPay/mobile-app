import * as SecureStore from 'expo-secure-store';

const REMOTE_PAYMENT_IDEMPOTENCY_KEY_PREFIX =
  'erumpay.remotePaymentIdempotencyKey.';

function getStoreKey(remoteRequestId: number | string) {
  return `${REMOTE_PAYMENT_IDEMPOTENCY_KEY_PREFIX}${remoteRequestId}`;
}

export async function getRemotePaymentIdempotencyKey(
  remoteRequestId: number | string,
) {
  return SecureStore.getItemAsync(getStoreKey(remoteRequestId));
}

export async function saveRemotePaymentIdempotencyKey(
  remoteRequestId: number | string,
  idempotencyKey: string,
) {
  await SecureStore.setItemAsync(getStoreKey(remoteRequestId), idempotencyKey);
}

export async function removeRemotePaymentIdempotencyKey(
  remoteRequestId: number | string,
) {
  await SecureStore.deleteItemAsync(getStoreKey(remoteRequestId));
}
