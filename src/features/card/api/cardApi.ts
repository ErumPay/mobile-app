import type { RegisterCardPayload, RegisteredCard } from '../types/card';
import { CARD_API_BASE_URL, CARD_API_TIMEOUT_MS } from './cardApiConfig';

const REGISTER_CARD_URL = `${CARD_API_BASE_URL}/api/v1/cards`;

function getCardUserHeaders() {
  return {
    'X-User-Id': String(process.env.EXPO_PUBLIC_DEV_USER_ID ?? '2'),
  };
}

export async function registerCard(
  payload: RegisterCardPayload,
): Promise<RegisteredCard> {
  const response = await fetchWithTimeout(
    REGISTER_CARD_URL,
    {
      method: 'POST',
      headers: {
        ...getCardUserHeaders(),
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    },
    CARD_API_TIMEOUT_MS,
  );

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(
      `CARD_REGISTER_REQUEST_FAILED:${response.status}:${errorBody}`,
    );
  }

  return normalizeRegisteredCard(await response.json());
}

function normalizeRegisteredCard(response: Record<string, unknown>): RegisteredCard {
  return {
    cardId: toFiniteNumber(response.cardId ?? response.card_id),
    cardProductId: toFiniteNumber(
      response.cardProductId ?? response.card_product_id,
    ),
    cardCompany: String(response.cardCompany ?? response.card_company ?? ''),
    cardName: String(response.cardName ?? response.card_name ?? ''),
    maskedNumber: String(response.maskedNumber ?? response.masked_number ?? ''),
    cardAlias: (response.cardAlias ?? response.card_alias ?? null) as
      | string
      | null,
    expiryYm: String(response.expiryYm ?? response.expiry_ym ?? ''),
    isDefault: Boolean(response.isDefault ?? response.is_default),
    status: String(response.status ?? ''),
  };
}

async function fetchWithTimeout(
  input: RequestInfo,
  init: RequestInit,
  timeoutMs: number,
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function toFiniteNumber(value: unknown) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : 0;
}
