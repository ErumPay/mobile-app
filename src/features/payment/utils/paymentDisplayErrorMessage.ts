const PAYMENT_RETRY_MESSAGE =
  '결제 정보가 변경되었습니다. 결제 정보를 다시 불러와 주세요.';
const PAYMENT_TEMPORARY_FAILURE_MESSAGE =
  '결제 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';

function readErrorCode(error: unknown) {
  if (error != null && typeof error === 'object') {
    const record = error as { code?: unknown; reason?: unknown };
    const code = typeof record.code === 'string' ? record.code : undefined;
    const reason = typeof record.reason === 'string' ? record.reason : undefined;

    return code ?? reason;
  }

  return undefined;
}

function readErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error != null && typeof error === 'object') {
    const message = (error as { message?: unknown }).message;

    return typeof message === 'string' ? message : undefined;
  }

  return undefined;
}

function includesAny(value: string, patterns: string[]) {
  return patterns.some((pattern) => value.includes(pattern));
}

export function getPaymentDisplayErrorMessage(
  error: unknown,
  fallbackMessage = PAYMENT_TEMPORARY_FAILURE_MESSAGE,
) {
  const code = readErrorCode(error);
  const message = readErrorMessage(error);
  const normalized = `${code ?? ''} ${message ?? ''}`.toUpperCase();

  if (
    includesAny(normalized, [
      'IDEMPOTENCY',
      '멱등성',
      'CORE_IDEMPOTENCY_KEY_MISMATCH',
      'CORE-IDEMPOTENCY',
    ])
  ) {
    return PAYMENT_RETRY_MESSAGE;
  }

  if (
    includesAny(normalized, [
      'PG_',
      'PG-',
      'SIM-',
      'BILLING',
      'TOKEN',
      'ENTITYMANAGER',
      'HIKARIPOOL',
      'CONNECTION IS NOT AVAILABLE',
    ])
  ) {
    return PAYMENT_TEMPORARY_FAILURE_MESSAGE;
  }

  return message || fallbackMessage;
}
