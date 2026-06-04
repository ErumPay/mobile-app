import type { RegisterCardPayload, RegisteredCard } from '../types/card';

const CARD_API_BASE_URL = 'http://192.168.0.135:8082';
const REGISTER_CARD_URL = `${CARD_API_BASE_URL}/api/v1/cards`;

export async function registerCard(
  payload: RegisterCardPayload,
): Promise<RegisteredCard> {
  const response = await fetch(REGISTER_CARD_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

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
    cardId: Number(response.cardId ?? response.card_id),
    cardProductId: Number(response.cardProductId ?? response.card_product_id),
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
