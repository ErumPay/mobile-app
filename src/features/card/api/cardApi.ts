import type { RegisterCardPayload, RegisteredCard } from '../types/card';
import { detectCardIssuer } from '../types/cardFormat';

const REGISTER_CARD_DELAY_MS = 500;

export async function registerCard(
  payload: RegisterCardPayload,
): Promise<RegisteredCard> {
  await new Promise<void>((resolve) => {
    setTimeout(() => resolve(), REGISTER_CARD_DELAY_MS);
  });

  return {
    id: `card-${Date.now()}`,
    last4: payload.cardNumber.slice(-4),
    issuer: detectCardIssuer(payload.cardNumber),
    holderName: '',
    cardNickname: payload.cardNickname,
    isDefault: false,
    createdAt: new Date().toISOString(),
  };
}
