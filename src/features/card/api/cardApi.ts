import type { RegisterCardPayload, RegisteredCard } from '../types/card';

const CARD_API_BASE_URL = 'http://192.168.0.21:8082';
const REGISTER_CARD_URL = `${CARD_API_BASE_URL}/api/v1/cards`;

export async function registerCard(
  payload: RegisterCardPayload,
): Promise<RegisteredCard> {
  const response = await fetch(REGISTER_CARD_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`CARD_REGISTER_REQUEST_FAILED:${response.status}`);
  }

  return response.json();
}
