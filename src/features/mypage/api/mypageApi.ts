import type {
  CardBenefit,
  CardPerformance,
  ManagedCard,
  PaymentBenefitType,
  PaymentDetail,
  PaymentHistoryItem,
  PaymentMethodType,
  PaymentStatus,
  UserProfile,
} from '../types/mypage';
import { getAuthSessionAccessToken } from '../../auth/api/authApi';
import { formatCurrency } from '../../../shared/utils/currency';
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

function formatDiscountAmount(amount: number) {
  return amount > 0 ? `-${formatCurrency(amount)}` : '0원';
}

function getMypageUserHeaders() {
  return {
    'X-User-Id': String(getMypageUserId()),
  };
}

export async function fetchUserProfile(): Promise<UserProfile> {
  return fetchUserProfileById(getMypageUserId());
}

export async function fetchUserProfileById(userId: number): Promise<UserProfile> {
  const response = await fetchWithTimeout(
    `${MYPAGE_AUTH_API_BASE_URL}/internal/v1/users/${userId}`,
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
  const accessToken = await getMypageAccessToken();
  const response = await fetchWithTimeout(
    `${MYPAGE_AUTH_API_BASE_URL}/api/v1/auth/withdraw/eligibility`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`MYPAGE_WITHDRAW_PENDING_REQUEST_FAILED:${response.status}`);
  }

  const data = (await response.json()) as Record<string, unknown>;
  const hasPending =
    typeof data.hasUnpaidPayments === 'boolean'
      ? data.hasUnpaidPayments
      : typeof data.possibility === 'boolean'
        ? !data.possibility
        : data.hasPending === true;

  return {
    hasPending,
    reason: toStringValue(data.message ?? data.reason) || undefined,
  };
}

export async function fetchManagedCards(): Promise<ManagedCard[]> {
  const response = await fetchWithTimeout(
    `${MYPAGE_CARD_API_BASE_URL}/api/v1/cards?userId=${getMypageUserId()}`,
    {
      headers: getMypageUserHeaders(),
    },
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
    `${MYPAGE_CARD_API_BASE_URL}/api/v1/cards/${cardId}/alias`,
    {
      method: 'PATCH',
      headers: {
        ...getMypageUserHeaders(),
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
    `${MYPAGE_CARD_API_BASE_URL}/api/v1/cards/${cardId}/default`,
    {
      method: 'PATCH',
      headers: getMypageUserHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(`MYPAGE_CARD_DEFAULT_REQUEST_FAILED:${response.status}`);
  }
}

export async function deleteManagedCard(cardId: string) {
  const response = await fetchWithTimeout(
    `${MYPAGE_CARD_API_BASE_URL}/api/v1/cards/${cardId}`,
    {
      method: 'DELETE',
      headers: getMypageUserHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(`MYPAGE_CARD_DELETE_REQUEST_FAILED:${response.status}`);
  }
}

export async function fetchCardBenefits(cardId: string): Promise<CardBenefit[]> {
  const response = await fetchWithTimeout(
    `${MYPAGE_CARD_API_BASE_URL}/api/v1/cards/${cardId}/benefits`,
    {
      headers: getMypageUserHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(`MYPAGE_CARD_BENEFITS_REQUEST_FAILED:${response.status}`);
  }

  const data = await response.json();
  const items = Array.isArray(data) ? data : [];

  return dedupeCardBenefits(items.map(normalizeCardBenefit));
}

export async function fetchCardPerformance(
  cardId: string,
  yearMonth = getCurrentYearMonth(),
): Promise<CardPerformance> {
  const response = await fetchWithTimeout(
    `${MYPAGE_CARD_API_BASE_URL}/api/v1/cards/${cardId}/performance?yearMonth=${yearMonth}`,
    {
      headers: getMypageUserHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(`MYPAGE_CARD_PERFORMANCE_REQUEST_FAILED:${response.status}`);
  }

  const data = (await response.json()) as Record<string, unknown>;

  return {
    yearMonth: toStringValue(data.yearMonth ?? data.year_month) || yearMonth,
    amount: toNumberValue(data.amount),
    discountAmount: toOptionalNumberValue(
      data.discountAmount ??
        data.discount_amount ??
        data.monthlyDiscountAmount ??
        data.monthly_discount_amount,
    ),
    targetAmount: toOptionalNumberValue(
      data.targetAmount ??
        data.target_amount ??
        data.targetPerformanceAmount ??
        data.target_performance_amount,
    ),
  };
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

  const data = (await response.json()) as Record<string, unknown>;
  const detail = normalizePaymentDetail(data);

  if (detail.method !== 'remote') {
    return detail;
  }

  const requesterUserId = toOptionalNumberValue(
    data.requesterUserId ?? data.requester_user_id,
  );
  const payerUserId = toOptionalNumberValue(
    data.payerUserId ??
      data.payer_user_id ??
      data.targetUserId ??
      data.target_user_id,
  );

  const [requesterProfile, payerProfile] = await Promise.all([
    detail.requesterName || requesterUserId == null
      ? null
      : fetchUserProfileById(requesterUserId).catch(() => null),
    detail.payerName || payerUserId == null
      ? null
      : fetchUserProfileById(payerUserId).catch(() => null),
  ]);

  return {
    ...detail,
    requesterName: detail.requesterName ?? requesterProfile?.name,
    payerName: detail.payerName ?? payerProfile?.name,
  };
}

export async function fetchPaymentHistoriesByCard(
  cardId: string,
): Promise<PaymentHistoryItem[]> {
  const response = await fetchWithTimeout(
    `${MYPAGE_PAYMENT_API_BASE_URL}/api/v1/payment/cards/${cardId}`,
    {
      headers: {
        'X-User-Id': String(getMypageUserId()),
      },
    },
  );

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error(`MYPAGE_CARD_PAYMENTS_REQUEST_FAILED:${response.status}`);
  }

  const data = (await response.json()) as Record<string, unknown>;
  const payments = Array.isArray(data.payments)
    ? (data.payments as Record<string, unknown>[])
    : [];

  return payments.map((payment, index) => ({
    id:
      toStringValue(payment.paymentId ?? payment.payment_id) ||
      `card-${cardId}-${index}`,
    cardId,
    method: normalizePaymentMethod(
      payment.paymentType ?? payment.payment_type,
    ),
    benefitType: normalizePaymentBenefit(
      payment.strategyType ?? payment.strategy_type,
    ),
    status: normalizePaymentStatus(payment.status),
    title:
      toStringValue(payment.merchantName ?? payment.merchant_name) || '결제',
    date: formatDateTimeToDate(
      toStringValue(payment.paidAt ?? payment.paid_at),
    ),
    amount: formatCurrency(toNumberValue(payment.amount)),
  }));
}

async function fetchWithTimeout(input: RequestInfo, init?: RequestInit) {
  const controller = new AbortController();
  const requestUrl = typeof input === 'string' ? input : input.url;
  const timeoutId = setTimeout(() => {
    if (__DEV__) {
      console.warn('Mypage API request timed out.', {
        url: requestUrl,
        timeoutMs: MYPAGE_API_TIMEOUT_MS,
      });
    }
    controller.abort();
  }, MYPAGE_API_TIMEOUT_MS);

  try {
    if (__DEV__) {
      console.log('Mypage API request.', {
        method: init?.method ?? 'GET',
        url: requestUrl,
      });
    }

    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function getMypageAccessToken() {
  const sessionAccessToken = getAuthSessionAccessToken();
  if (sessionAccessToken) {
    return sessionAccessToken;
  }

  throw new Error('로그인 후 다시 시도해주세요.');
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
  const imageUrl = toStringValue(
    response.imageUrl ?? response.image_url ?? response.cardImageUrl,
  );
  const registeredAt = toStringValue(
    response.createdAt ?? response.created_at ?? response.registeredAt,
  );
  const last4 = maskedNumber.replace(/\D/g, '').slice(-4);

  return {
    id,
    cardProductId: toOptionalNumberValue(
      response.cardProductId ?? response.card_product_id,
    ),
    issuer,
    title: `${issuer || '카드'} (${last4 || '****'})`,
    name: name || '등록 카드',
    alias: alias || '별칭미설정',
    cardNumber: maskedNumber || '**** **** **** ****',
    imageUrl,
    registeredAt: formatDateTimeToDate(registeredAt),
    colorClassName: CARD_COLORS[index % CARD_COLORS.length],
    isDefault: Boolean(response.isDefault ?? response.is_default),
    disabled: status !== 'ACTIVE',
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
  const descriptionBody = removeDuplicateBenefitLines(
    removeFirstBenefitSentence(benefitDesc, title),
    title,
  );
  const description = [descriptionBody, brandNames ? `대상 ${brandNames}` : '']
    .filter(Boolean)
    .join('\n');
  const tiers = Array.isArray(response.tiers)
    ? (response.tiers as Record<string, unknown>[])
    : [];
  const performanceThresholds = tiers
    .map((tier) =>
      toOptionalNumberValue(
        tier.minPrevMonthUsage ?? tier.min_prev_month_usage,
      ),
    )
    .filter((amount): amount is number => amount != null && amount > 0);

  return {
    title,
    description: description || '혜택 정보가 없습니다.',
    performanceThresholds,
  };
}

function dedupeCardBenefits(benefits: CardBenefit[]) {
  const seen = new Set<string>();

  return benefits.filter((benefit) => {
    const key = normalizeBenefitKey(benefit.title);

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function normalizeBenefitKey(value: string) {
  return value.replace(/\s+/g, ' ').trim();
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

function removeDuplicateBenefitLines(description: string, title: string) {
  const seen = new Set<string>();

  return description
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => {
      if (!line || line === title || seen.has(line)) {
        return false;
      }

      seen.add(line);
      return true;
    })
    .join('\n');
}

function normalizePaymentHistoryItem(
  response: Record<string, unknown>,
): PaymentHistoryItem {
  const paymentId = toStringValue(response.paymentId ?? response.payment_id);
  const method = normalizePaymentMethod(response.paymentType);
  const benefitType = normalizePaymentBenefit(response.strategyType);
  const status = normalizePaymentStatus(response.status);
  const paidAt = toStringValue(response.paidAt ?? response.paid_at);
  const cards = Array.isArray(response.cards)
    ? (response.cards as Record<string, unknown>[])
    : [];
  const firstCard = cards[0];

  return {
    id: paymentId,
    cardId: toStringValue(
      response.cardId ??
        response.card_id ??
        firstCard?.cardId ??
        firstCard?.card_id,
    ) || undefined,
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
  const requesterUserId = toStringValue(
    response.requesterUserId ?? response.requester_user_id,
  );
  const payerUserId = toStringValue(
    response.payerUserId ??
      response.payer_user_id ??
      response.targetUserId ??
      response.target_user_id,
  );
  const explicitRemoteRole = toStringValue(
    response.remoteRole ?? response.remote_role ?? response.viewerRole,
  ).toUpperCase();
  const currentUserId = String(getMypageUserId());
  const remoteRole =
    explicitRemoteRole === 'REQUESTER'
      ? 'requester'
      : explicitRemoteRole === 'PAYER' || explicitRemoteRole === 'TARGET'
        ? 'payer'
        : requesterUserId && requesterUserId === currentUserId
          ? 'requester'
          : payerUserId && payerUserId === currentUserId
            ? 'payer'
            : undefined;

  return {
    ...history,
    cardId: toStringValue(cards[0]?.cardId ?? cards[0]?.card_id),
    cardIds: cards.map((card) => toStringValue(card.cardId ?? card.card_id)),
    cards: cards.map(normalizePaymentDetailCard),
    paidAt: formatDateTime(paidAt),
    receiptId: toStringValue(response.orderNo ?? response.order_no) || history.id,
    sellerName:
      toStringValue(response.merchantName ?? response.merchant_name) ||
      history.title,
    businessNumber:
      toStringValue(response.businessNumber ?? response.business_number) || '-',
    address:
      toStringValue(response.businessAddress ?? response.business_address) || '-',
    ownerName: toStringValue(response.ownerName ?? response.owner_name) || '-',
    phone:
      toStringValue(response.contactPhone ?? response.contact_phone) || '-',
    productAmount: formatCurrency(productAmount),
    discountAmount: formatDiscountAmount(discountAmount),
    tax: '0원',
    finalAmount: formatCurrency(finalAmount),
    status: canceledAt ? 'canceled' : history.status,
    remoteRole,
    requesterName:
      toStringValue(response.requesterName ?? response.requester_name) ||
      undefined,
    payerName:
      toStringValue(
        response.payerName ??
          response.payer_name ??
          response.targetName ??
          response.target_name,
      ) || undefined,
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
  const paidAmount = toNumberValue(
    response.paidAmount ?? response.paid_amount,
  );
  const discountAmount = toNumberValue(
    response.discountAmount ?? response.discount_amount,
  );

  return {
    id,
    name: name || '등록 카드',
    maskedNumber: maskedNumber || '-',
    paidAmount: formatCurrency(paidAmount),
    discountAmount: formatDiscountAmount(discountAmount),
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

  if (
    status === 'CANCELED' ||
    status === 'CANCELLED' ||
    status === 'VOIDED' ||
    status === '결제취소'
  ) {
    return 'canceled';
  }
  if (status === 'CANCEL_REQUESTED' || status === '결제취소요청') {
    return 'cancelRequested';
  }
  return 'completed';
}

function toStringValue(value: unknown) {
  return value == null ? '' : String(value);
}

function toNumberValue(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function toOptionalNumberValue(value: unknown) {
  if (value == null || String(value).trim() === '') {
    return undefined;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
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

function getCurrentYearMonth() {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
}
