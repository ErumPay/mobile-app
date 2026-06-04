import type { OcrCardResult } from '../types/card';
import { CARD_OCR_BASE_URL } from './cardApiConfig';

const CARD_OCR_URL = `${CARD_OCR_BASE_URL}/api/v1/cards/ocr`;

interface CardOcrApiResponse {
  cardNumber: string | null;
  expiryYm: string | null;
  confidence: number;
  warnings: string[];
}

export async function uploadCardImage(
  imageUri: string,
): Promise<OcrCardResult> {
  const formData = new FormData();

  formData.append('image', {
    uri: imageUri,
    name: 'card.jpg',
    type: 'image/jpeg',
  } as unknown as Blob);

  const response = await fetch(CARD_OCR_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`CARD_OCR_REQUEST_FAILED:${response.status}`);
  }

  const result = (await response.json()) as CardOcrApiResponse;

  return {
    cardNumber: result.cardNumber ?? '',
    expiry: toExpiryInputValue(result.expiryYm),
  };
}

function toExpiryInputValue(expiryYm: string | null): string {
  if (!expiryYm) {
    return '';
  }

  const digits = expiryYm.replace(/\D/g, '');

  if (digits.length !== 6) {
    return '';
  }

  return `${digits.slice(4, 6)}/${digits.slice(2, 4)}`;
}
