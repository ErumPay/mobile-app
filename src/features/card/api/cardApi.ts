import type { RegisterCardPayload, RegisteredCard } from '../types/card';
import {
  CARD_API_BASE_URL,
  CARD_API_TIMEOUT_MS,
  getCardRegisterUserId,
} from './cardApiConfig';

const CARDS_URL = `${CARD_API_BASE_URL}/api/v1/cards`;

export class CardApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'CardApiError';
  }
}

function getCardUserHeaders(userId: number) {
  return {
    'X-User-Id': String(userId),
  };
}

export async function registerCard(
  payload: RegisterCardPayload,
): Promise<RegisteredCard> {
  const currentUserId = getCardRegisterUserId();

  if (payload.userId !== currentUserId) {
    throw new CardApiError(
      0,
      'CARD_REGISTER_USER_MISMATCH',
      '로그인 사용자 정보가 카드 등록 요청과 일치하지 않습니다.',
    );
  }

  const response = await fetchWithTimeout(
    CARDS_URL,
    {
      method: 'POST',
      headers: {
        ...getCardUserHeaders(payload.userId),
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    },
    CARD_API_TIMEOUT_MS,
  );

  if (!response.ok) {
    const errorBody = await parseErrorBody(response);
    throw new CardApiError(
      response.status,
      errorBody.code,
      errorBody.message,
    );
  }

  return normalizeRegisteredCard(await response.json());
}

export async function fetchRegisteredCards(): Promise<RegisteredCard[]> {
  const currentUserId = getCardRegisterUserId();

  const response = await fetchWithTimeout(
    CARDS_URL,
    {
      method: 'GET',
      headers: getCardUserHeaders(currentUserId),
    },
    CARD_API_TIMEOUT_MS,
  );

  if (!response.ok) {
    const errorBody = await parseErrorBody(response);
    throw new CardApiError(
      response.status,
      errorBody.code,
      errorBody.message,
    );
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    throw new CardApiError(
      response.status,
      'CARD_RESPONSE_SCHEMA_INVALID',
      '등록 카드 응답 형식이 올바르지 않습니다.',
    );
  }

  return data.map((item) => normalizeRegisteredCard(toRecord(item)));
}

function toRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new CardApiError(
      0,
      'CARD_ITEM_SCHEMA_INVALID',
      '등록 카드 항목 형식이 올바르지 않습니다.',
    );
  }

  return value as Record<string, unknown>;
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

async function parseErrorBody(response: Response) {
  const fallback = {
    code: 'CARD_REGISTER_REQUEST_FAILED',
    message: '카드 등록 요청에 실패했습니다.',
  };

  try {
    const body = (await response.json()) as Record<string, unknown>;

    return {
      code: String(body.code ?? fallback.code),
      message: String(body.message ?? fallback.message),
    };
  } catch {
    return fallback;
  }
}

function toFiniteNumber(value: unknown) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : 0;
}
