import { CardApiError } from '../api/cardApi';
import type { CardRegisterFailureType } from '../types/cardRegisterFailure';

const CARD_REGISTER_ERROR_CODES = {
  AUTHENTICATION: new Set([
    'CARD-AUTH-301',
    'CARD_AUTHENTICATION_FAILED',
  ]),
  UNAVAILABLE: new Set([
    'CARD-CARD-303',
    'CARD_UNAVAILABLE',
  ]),
  SYSTEM: new Set([
    'CARD-BILL-402',
    'CARD-BILL-403',
    'CARD-SYS-900',
  ]),
} as const;

export function resolveCardRegisterFailureType(
  error: unknown,
): CardRegisterFailureType {
  if (!(error instanceof CardApiError)) {
    return 'SYSTEM';
  }

  if (CARD_REGISTER_ERROR_CODES.AUTHENTICATION.has(error.code)) {
    return 'AUTHENTICATION';
  }

  if (CARD_REGISTER_ERROR_CODES.UNAVAILABLE.has(error.code)) {
    return 'UNAVAILABLE';
  }

  if (error.status >= 500 || CARD_REGISTER_ERROR_CODES.SYSTEM.has(error.code)) {
    return 'SYSTEM';
  }

  return 'GENERAL';
}
