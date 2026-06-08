export const CARD_API_BASE_URL =
  process.env.EXPO_PUBLIC_CARD_API_BASE_URL ?? 'http://localhost:8082';

export const CARD_OCR_BASE_URL =
  process.env.EXPO_PUBLIC_CARD_OCR_BASE_URL ?? 'http://localhost:8086';

export const CARD_API_TIMEOUT_MS = 15000;

export function getCardRegisterUserId(): number {
  throw new Error('카드 등록 사용자 정보 연동이 필요합니다.');
}
