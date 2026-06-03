import type {
  CardBenefit,
  ManagedCard,
  PaymentDetail,
  PaymentHistoryItem,
  UserProfile,
} from '../types/mypage';

export const mockUserProfile: UserProfile = {
  name: '조이름',
  maskedId: '3293',
  phone: '010-0000-0000',
  birthDate: '1993-03-15',
};

export const mockManagedCards: ManagedCard[] = [
  {
    id: 'card-1',
    issuer: '신한카드',
    title: '신한카드 (1234)',
    name: 'Nany My 카드',
    alias: '생활비 카드',
    cardNumber: '3424 **** **** 1234',
    registeredAt: '2026.03.15',
    colorClassName: 'bg-blue-700',
    isDefault: true,
    hasPayments: false,
  },
  {
    id: 'card-2',
    issuer: '삼성카드',
    title: '삼성카드 (4444)',
    name: 'taptap O',
    alias: '온라인 결제',
    cardNumber: '4444 **** **** 4444',
    registeredAt: '2026.04.10',
    colorClassName: 'bg-indigo-700',
    isDefault: false,
    hasPayments: true,
  },
  {
    id: 'card-3',
    issuer: 'KB국민카드',
    title: '국민카드 (5893)',
    name: '위시 카드',
    alias: '별칭미설정',
    cardNumber: '5893 **** **** 9012',
    registeredAt: '2026.05.02',
    colorClassName: 'bg-amber-700',
    isDefault: false,
    disabled: true,
    hasPayments: false,
  },
];

export const mockCardBenefits: CardBenefit[] = [
  {
    title: '해외 온/오프라인 적립',
    description: '해외 온/오프라인 결제 시 조건 없이 포인트가 적립됩니다.',
  },
  {
    title: '네이버플러스 멤버십 적립',
    description: '정기결제 및 멤버십 이용 금액에 대해 추가 적립 혜택을 제공합니다.',
  },
  {
    title: '국내 온/오프라인 가맹점 적립',
    description: '국내 가맹점 결제 시 기본 적립 혜택이 적용됩니다.',
  },
];

export const mockPaymentHistories: PaymentHistoryItem[] = [
  {
    id: 'payment-1',
    cardId: 'card-1',
    method: 'dutchpay',
    benefitType: 'splitBenefit',
    status: 'completed',
    title: 'Luxury Hotel Stay',
    date: '2026.04.23',
    amount: '34,000원',
  },
  {
    id: 'payment-2',
    cardId: 'card-1',
    method: 'remote',
    benefitType: 'singleBenefit',
    status: 'cancelRequested',
    title: '코드보안 양성소',
    date: '2026.04.18',
    amount: '34,000원',
  },
  {
    id: 'payment-3',
    cardId: 'card-2',
    method: 'solo',
    benefitType: 'singleBenefit',
    status: 'canceled',
    title: '서울순대국',
    date: '2026.04.16',
    amount: '8,000원',
  },
  {
    id: 'payment-4',
    cardId: 'card-2',
    method: 'solo',
    benefitType: 'singlePerformance',
    status: 'completed',
    title: '스타벅스 코리아 양성점',
    date: '2026.04.05',
    amount: '18,300원',
  },
  {
    id: 'payment-5',
    cardId: 'card-1',
    method: 'dutchpay',
    benefitType: 'splitBenefit',
    status: 'canceled',
    title: '유니클로 양동포점',
    date: '2026.04.02',
    amount: '52,900원',
  },
  {
    id: 'payment-6',
    cardId: 'card-2',
    method: 'remote',
    benefitType: 'splitPerformance',
    status: 'completed',
    title: '무인양품 청담센타운',
    date: '2026.04.01',
    amount: '3,334,000원',
  },
];

export const mockPaymentDetails: Record<string, PaymentDetail> = {
  'payment-1': {
    ...mockPaymentHistories[0],
    paidAt: '2026.04.25 21:00:01',
    receiptId: '123-456-789',
    sellerName: '코보문고 작성점',
    businessNumber: '123-45-67890',
    address: '서울 마포구 작성길 10',
    ownerName: '나사장',
    phone: '02-987-7654',
    productAmount: '34,000원',
    discountAmount: '-4,070원',
    tax: '3,090원',
    finalAmount: '33,020원',
  },
};
