import type {
  CardBenefit,
  ManagedCard,
  UserProfile,
} from '../types/mypage';
import {
  getMypageUserId,
  MYPAGE_API_TIMEOUT_MS,
  MYPAGE_AUTH_API_BASE_URL,
  MYPAGE_CARD_API_BASE_URL,
} from './mypageApiConfig';

const CARD_COLORS = [
  'bg-blue-700',
  'bg-indigo-700',
  'bg-emerald-700',
  'bg-amber-700',
  'bg-slate-700',
];

export async function fetchUserProfile(): Promise<UserProfile> {
  const response = await fetchWithTimeout(
    `${MYPAGE_AUTH_API_BASE_URL}/internal/v1/users/${getMypageUserId()}`,
  );

  if (!response.ok) {
    throw new Error(`MYPAGE_PROFILE_REQUEST_FAILED:${response.status}`);
  }

  return normalizeUserProfile(await response.json());
}

export async function fetchManagedCards(): Promise<ManagedCard[]> {
  const response = await fetchWithTimeout(
    `${MYPAGE_CARD_API_BASE_URL}/api/v1/cards?${new URLSearchParams({
      userId: String(getMypageUserId()),
    })}`,
  );

  if (!response.ok) {
    throw new Error(`MYPAGE_CARDS_REQUEST_FAILED:${response.status}`);
  }

  const data = await response.json();
  const items = Array.isArray(data) ? data : [];

  return items.map((item, index) => normalizeManagedCard(item, index));
}

export async function updateManagedCardAlias(cardId: string, alias: string) {
  const response = await fetchWithTimeout(
    `${MYPAGE_CARD_API_BASE_URL}/api/v1/cards/${cardId}/alias?${new URLSearchParams({
      userId: String(getMypageUserId()),
    })}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({ cardAlias: alias.trim() || null }),
    },
  );

  if (!response.ok) {
    throw new Error(`MYPAGE_CARD_ALIAS_REQUEST_FAILED:${response.status}`);
  }
}

export async function setManagedDefaultCard(cardId: string) {
  const response = await fetchWithTimeout(
    `${MYPAGE_CARD_API_BASE_URL}/api/v1/cards/${cardId}/default?${new URLSearchParams({
      userId: String(getMypageUserId()),
    })}`,
    {
      method: 'PATCH',
    },
  );

  if (!response.ok) {
    throw new Error(`MYPAGE_CARD_DEFAULT_REQUEST_FAILED:${response.status}`);
  }
}

export async function deleteManagedCard(cardId: string) {
  const response = await fetchWithTimeout(
    `${MYPAGE_CARD_API_BASE_URL}/api/v1/cards/${cardId}?${new URLSearchParams({
      userId: String(getMypageUserId()),
    })}`,
    {
      method: 'DELETE',
    },
  );

  if (!response.ok) {
    throw new Error(`MYPAGE_CARD_DELETE_REQUEST_FAILED:${response.status}`);
  }
}

export async function fetchCardBenefits(cardId: string): Promise<CardBenefit[]> {
  const response = await fetchWithTimeout(
    `${MYPAGE_CARD_API_BASE_URL}/api/v1/cards/${cardId}/benefits?${new URLSearchParams({
      userId: String(getMypageUserId()),
    })}`,
  );

  if (!response.ok) {
    throw new Error(`MYPAGE_CARD_BENEFITS_REQUEST_FAILED:${response.status}`);
  }

  const data = await response.json();
  const items = Array.isArray(data) ? data : [];

  return items.map(normalizeCardBenefit);
}

async function fetchWithTimeout(input: RequestInfo, init?: RequestInit) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), MYPAGE_API_TIMEOUT_MS);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function normalizeUserProfile(response: Record<string, unknown>): UserProfile {
  const name = toStringValue(response.name);
  const phone = formatPhoneNumber(toStringValue(response.phoneNumber));
  const birthDate = formatBirthDate(toStringValue(response.birthDate));

  return {
    name,
    maskedId: toStringValue(response.userId).slice(-4),
    phone,
    birthDate,
  };
}

function normalizeManagedCard(
  response: Record<string, unknown>,
  index: number,
): ManagedCard {
  const id = toStringValue(response.cardId ?? response.card_id);
  const issuer = toStringValue(response.cardCompany ?? response.card_company);
  const name = toStringValue(response.cardName ?? response.card_name);
  const maskedNumber = toStringValue(
    response.maskedNumber ?? response.masked_number,
  );
  const alias = toStringValue(
    response.cardAlias ?? response.card_alias ?? '별칭미설정',
  );
  const status = toStringValue(response.status).toUpperCase();
  const last4 = maskedNumber.replace(/\D/g, '').slice(-4);

  return {
    id,
    issuer,
    title: `${issuer || '카드'} (${last4 || '****'})`,
    name: name || '등록 카드',
    alias: alias || '별칭미설정',
    cardNumber: maskedNumber || '**** **** **** ****',
    registeredAt: '',
    colorClassName: CARD_COLORS[index % CARD_COLORS.length],
    isDefault: Boolean(response.isDefault ?? response.is_default),
    disabled: status !== '' && status !== 'ACTIVE',
    hasPayments: false,
  };
}

function normalizeCardBenefit(response: Record<string, unknown>): CardBenefit {
  const title =
    toStringValue(response.serviceCategory) ||
    toStringValue(response.benefitType) ||
    '카드 혜택';
  const brandNames = Array.isArray(response.brandNames)
    ? response.brandNames.map(String).join(', ')
    : '';
  const benefitDesc = toStringValue(response.benefitDesc);
  const description = [benefitDesc, brandNames ? `대상: ${brandNames}` : '']
    .filter(Boolean)
    .join('\n');

  return {
    title,
    description: description || '혜택 정보가 없습니다.',
  };
}

function toStringValue(value: unknown) {
  return value == null ? '' : String(value);
}

function formatPhoneNumber(phoneNumber: string) {
  const digits = phoneNumber.replace(/\D/g, '');

  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  return phoneNumber;
}

function formatBirthDate(birthDate: string) {
  const digits = birthDate.replace(/\D/g, '');

  if (digits.length === 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
  }

  return birthDate;
}
