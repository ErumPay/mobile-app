import type {
  CardBenefit,
  ManagedCard,
  PaymentBenefitType,
  PaymentDetail,
  PaymentHistoryItem,
  PaymentMethodType,
  PaymentStatus,
  UserProfile,
} from '../types/mypage';
import {
  getMypageUserId,
  MYPAGE_API_TIMEOUT_MS,
  MYPAGE_AUTH_API_BASE_URL,
  MYPAGE_CARD_API_BASE_URL,
  MYPAGE_PAYMENT_API_BASE_URL,
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

export async function logoutUser() {
  const accessToken = await getMypageAccessToken();
  const response = await fetchWithTimeout(
    `${MYPAGE_AUTH_API_BASE_URL}/api/v1/auth/logout`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({ deviceId: 'mobile-app-dev' }),
    },
  );

  if (!response.ok) {
    throw new Error(`MYPAGE_LOGOUT_REQUEST_FAILED:${response.status}`);
  }
}

export async function withdrawUser(pin: string) {
  const accessToken = await getMypageAccessToken();
  const response = await fetchWithTimeout(
    `${MYPAGE_AUTH_API_BASE_URL}/api/v1/auth/withdraw`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({ pin }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(
      `MYPAGE_WITHDRAW_REQUEST_FAILED:${response.status}:${errorBody}`,
    );
  }
}

export async function checkWithdrawPendingTransactions(): Promise<{
  hasPending: boolean;
  reason?: string;
}> {
  const response = await fetchWithTimeout(
    `${MYPAGE_PAYMENT_API_BASE_URL}/internal/v1/payments/users/${getMypageUserId()}/pending`,
  );

  if (!response.ok) {
    throw new Error(`MYPAGE_WITHDRAW_PENDING_REQUEST_FAILED:${response.status}`);
  }

  return response.json();
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

type FetchPaymentHistoriesParams = {
  status?: 'ALL' | 'PAID' | 'CANCELED';
  period?: 'WEEK' | 'MONTH' | 'YEAR';
  start?: string;
  end?: string;
  paymentType?: 'SINGLE' | 'DUTCH' | 'REMOTE';
  strategyType?: 'BENEFIT_SINGLE' | 'BENEFIT_SPLIT' | 'PERF_SINGLE' | 'PERF_SPLIT';
};

export async function fetchPaymentHistories(
  params: FetchPaymentHistoriesParams = {},
): Promise<PaymentHistoryItem[]> {
  const searchParams = new URLSearchParams({
    page: '0',
    status: params.status ?? 'ALL',
  });

  if (params.period) searchParams.append('period', params.period);
  if (params.start) searchParams.append('start', params.start);
  if (params.end) searchParams.append('end', params.end);
  if (params.paymentType) searchParams.append('paymentType', params.paymentType);
  if (params.strategyType) searchParams.append('strategyType', params.strategyType);

  const response = await fetchWithTimeout(
    `${MYPAGE_PAYMENT_API_BASE_URL}/api/v1/payment?${searchParams}`,
    {
      headers: {
        'X-User-Id': String(getMypageUserId()),
      },
    },
  );

  if (!response.ok) {
    throw new Error(`MYPAGE_PAYMENTS_REQUEST_FAILED:${response.status}`);
  }

  const data = await response.json();
  const items = Array.isArray(data.items) ? data.items : [];

  return items.map(normalizePaymentHistoryItem);
}

export async function fetchPaymentDetail(
  paymentId: string,
): Promise<PaymentDetail> {
  const response = await fetchWithTimeout(
    `${MYPAGE_PAYMENT_API_BASE_URL}/api/v1/payment/${paymentId}`,
    {
      headers: {
        'X-User-Id': String(getMypageUserId()),
      },
    },
  );

  if (!response.ok) {
    throw new Error(`MYPAGE_PAYMENT_DETAIL_REQUEST_FAILED:${response.status}`);
  }

  return normalizePaymentDetail(await response.json());
}

export async function fetchPaymentHistoriesByCard(
  cardId: string,
): Promise<PaymentHistoryItem[]> {
  const payments = await fetchPaymentHistories();
  const paymentDetails = await Promise.all(
    payments.map((payment) =>
      fetchPaymentDetail(payment.id).catch((error) => {
        console.warn('Failed to fetch payment detail for card matching.', error);
        return null;
      }),
    ),
  );

  return paymentDetails
    .filter((payment): payment is PaymentDetail => Boolean(payment))
    .filter((payment) =>
      (payment.cards ?? []).some((card) => card.id === cardId),
    )
    .map((payment) => ({
      id: payment.id,
      cardId,
      method: payment.method,
      benefitType: payment.benefitType,
      status: payment.status,
      title: payment.title,
      date: payment.date,
      amount: payment.amount,
    }));
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

async function getMypageAccessToken() {
  const configuredToken = process.env.EXPO_PUBLIC_DEV_ACCESS_TOKEN;

  if (configuredToken) {
    return configuredToken;
  }

  const response = await fetchWithTimeout(
    `${MYPAGE_AUTH_API_BASE_URL}/api/v1/auth/dev/token/${getMypageUserId()}`,
  );

  if (!response.ok) {
    throw new Error(`MYPAGE_DEV_TOKEN_REQUEST_FAILED:${response.status}`);
  }

  const data = await response.json();
  const accessToken = toStringValue(data.accessToken);

  if (!accessToken) {
    throw new Error('MYPAGE_DEV_TOKEN_EMPTY');
  }

  return accessToken;
}

function normalizeUserProfile(response: Record<string, unknown>): UserProfile {
  const name = toStringValue(response.name);
  const phone = formatPhoneNumber(toStringValue(response.phoneNumber));
  const birthDate = formatBirthDate(toStringValue(response.birthDate));
  const phoneLast4 = phone.replace(/\D/g, '').slice(-4);

  return {
    name,
    maskedId: phoneLast4 || toStringValue(response.userId).slice(-4),
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
  const benefitDesc = toStringValue(response.benefitDesc);
  const title =
    getFirstBenefitSentence(benefitDesc) ||
    toStringValue(response.serviceCategory) ||
    toStringValue(response.benefitType) ||
    '카드 혜택';
  const brandNames = Array.isArray(response.brandNames)
    ? response.brandNames.map(String).join(', ')
    : '';
  const descriptionBody = removeFirstBenefitSentence(benefitDesc, title);
  const description = [descriptionBody, brandNames ? `대상 ${brandNames}` : '']
    .filter(Boolean)
    .join('\n');

  return {
    title,
    description: description || '혜택 정보가 없습니다.',
  };
}

function getFirstBenefitSentence(description: string) {
  const normalized = description.trim();

  if (!normalized) {
    return '';
  }

  const [firstLine] = normalized.split(/\r?\n/);
  const sentenceMatch = firstLine.match(/^.*?[.!?](?=\s|$)/);

  return (sentenceMatch?.[0] ?? firstLine).trim();
}

function removeFirstBenefitSentence(description: string, title: string) {
  const normalized = description.trim();

  if (!normalized || !title) {
    return normalized;
  }

  return normalized.startsWith(title)
    ? normalized.slice(title.length).trim()
    : normalized;
}

function normalizePaymentHistoryItem(
  response: Record<string, unknown>,
): PaymentHistoryItem {
  const paymentId = toStringValue(response.paymentId ?? response.payment_id);
  const method = normalizePaymentMethod(response.paymentType);
  const benefitType = normalizePaymentBenefit(response.strategyType);
  const status = normalizePaymentStatus(response.status);
  const paidAt = toStringValue(response.paidAt ?? response.paid_at);

  return {
    id: paymentId,
    cardId: '',
    method,
    benefitType,
    status,
    title: toStringValue(response.orderName ?? response.order_name) || '결제',
    date: formatDateTimeToDate(paidAt),
    amount: formatCurrency(toNumberValue(response.amount)),
  };
}

function normalizePaymentDetail(response: Record<string, unknown>): PaymentDetail {
  const history = normalizePaymentHistoryItem(response);
  const cards = Array.isArray(response.cards)
    ? (response.cards as Record<string, unknown>[])
    : [];
  const paidAt = toStringValue(response.paidAt ?? response.paid_at);
  const canceledAt = toStringValue(response.canceledAt ?? response.canceled_at);
  const discountAmount = cards.reduce(
    (sum, card) => sum + toNumberValue(card.discountAmount ?? card.discount_amount),
    0,
  );
  const productAmount = toNumberValue(response.amount);
  const finalAmount = Math.max(productAmount - discountAmount, 0);

  return {
    ...history,
    cardId: toStringValue(cards[0]?.cardId ?? cards[0]?.card_id),
    cardIds: cards.map((card) => toStringValue(card.cardId ?? card.card_id)),
    cards: cards.map(normalizePaymentDetailCard),
    paidAt: formatDateTime(paidAt),
    receiptId: toStringValue(response.orderNo ?? response.order_no) || history.id,
    sellerName: history.title,
    businessNumber: '-',
    address: '-',
    ownerName: '-',
    phone: '-',
    productAmount: formatCurrency(productAmount),
    discountAmount: discountAmount > 0 ? `-${formatCurrency(discountAmount)}` : '0원',
    tax: '0원',
    finalAmount: formatCurrency(finalAmount),
    status: canceledAt ? 'canceled' : history.status,
  };
}

function normalizePaymentDetailCard(
  response: Record<string, unknown>,
) {
  const id = toStringValue(response.cardId ?? response.card_id);
  const name = toStringValue(response.cardName ?? response.card_name);
  const maskedNumber = toStringValue(
    response.maskedNumber ?? response.masked_number,
  );

  return {
    id,
    name: name || '등록 카드',
    maskedNumber: maskedNumber || '-',
  };
}

function normalizePaymentMethod(value: unknown): PaymentMethodType {
  const type = toStringValue(value).toUpperCase();

  if (type === 'REMOTE') return 'remote';
  if (type === 'DUTCH') return 'dutchpay';
  return 'solo';
}

function normalizePaymentBenefit(value: unknown): PaymentBenefitType {
  const type = toStringValue(value).toUpperCase();

  if (type === 'BENEFIT_SPLIT') return 'splitBenefit';
  if (type === 'PERF_SINGLE') return 'singlePerformance';
  if (type === 'PERF_SPLIT') return 'splitPerformance';
  return 'singleBenefit';
}

function normalizePaymentStatus(value: unknown): PaymentStatus {
  const status = toStringValue(value).toUpperCase();

  if (status === 'CANCELED' || status === 'VOIDED') return 'canceled';
  if (status === 'CANCEL_REQUESTED') return 'cancelRequested';
  return 'completed';
}

function toStringValue(value: unknown) {
  return value == null ? '' : String(value);
}

function toNumberValue(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function formatCurrency(value: number) {
  return `${Math.trunc(value).toLocaleString('ko-KR')}원`;
}

function formatDateTimeToDate(value: string) {
  if (!value) return '-';
  return value.slice(0, 10).replace(/-/g, '.');
}

function formatDateTime(value: string) {
  if (!value) return '-';

  return value.replace('T', ' ').slice(0, 19);
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
