import type { PaymentCardSelectData } from '../types/paymentCard.types';

const shinhanCard = {
    id: 'card-shinhan-1',
    amount: 45000,
    cardName: '신한카드',
    cardCompany: '신한은행',
    maskedNumber: '**** **** **** 1234',
    expiryDate: '05/24',
    theme: 'BLUE' as const,
    imageUrl:
        'https://d1c5n4ri2guedi.cloudfront.net/card/2885/card_img/44212/2885card_1.png',
    imageOrientation: 'VERTICAL' as const,
    benefitDescription: '온라인 쇼핑 최대 혜택',
    isPrimary: true,
};

const samsungCard = {
    id: 'card-samsung-1',
    amount: 45000,
    cardName: '삼성카드',
    cardCompany: '삼성카드',
    maskedNumber: '**** **** **** 5678',
    expiryDate: '08/26',
    theme: 'PURPLE' as const,
    imageUrl: 'https://d1c5n4ri2guedi.cloudfront.net/card/13/card_img/28201/13card.png',
    imageOrientation: 'VERTICAL' as const,
};

const kbCard = {
    id: 'card-kb-1',
    amount: 45000,
    cardName: 'KB국민카드',
    cardCompany: 'KB국민카드',
    maskedNumber: '**** **** **** 9012',
    expiryDate: '11/27',
    theme: 'ORANGE' as const,
    imageUrl: 'https://d1c5n4ri2guedi.cloudfront.net/card/49/card_img/42288/49card.png',
    imageOrientation: 'VERTICAL' as const,
};

const shinhanSubCard = {
    id: 'card-shinhan-2',
    amount: 45000,
    cardName: '신한카드',
    cardCompany: '신한은행',
    maskedNumber: '**** **** **** 1234',
    expiryDate: '05/24',
    theme: 'ORANGE' as const,
    imageUrl: 'https://d1c5n4ri2guedi.cloudfront.net/card/2687/card_img/33239/2687card.png',
    imageOrientation: 'HORIZONTAL' as const,
    benefitDescription: '온라인 쇼핑 5% 캐시백',
};

export const mockNormalPaymentCardSelectData: PaymentCardSelectData = {
    flowType: 'NORMAL',
    recommendedCard: {
        title: '이룸페이가 추천해요!',
        badgeText: 'BEST',
        card: shinhanCard,
    },
    registeredCards: [shinhanCard, samsungCard, kbCard],
    cardCombinations: [
        {
            type: 'SINGLE_BENEFIT',
            label: '단일혜택',
            description: '혜택 최대화',
            benefitDescription: '온라인 쇼핑 5% 캐시백',
            cards: [shinhanCard],
        },
        {
            type: 'SINGLE_PERFORMANCE',
            label: '단일실적',
            description: '실적 채우기',
            cards: [],
        },
        {
            type: 'SPLIT_BENEFIT',
            label: '분할혜택',
            description: '혜택 최대화',
            benefitDescription: '온라인 쇼핑 5% 캐시백',
            cards: [shinhanCard, shinhanSubCard],
        },
        {
            type: 'SPLIT_PERFORMANCE',
            label: '분할실적',
            description: '실적 채우기',
            cards: [],
        },
    ],
};

export const mockDutchPayPaymentCardSelectData: PaymentCardSelectData = {
    flowType: 'DUTCH_PAY',
    recommendedCard: {
        title: '대표카드로 결제할게요!',
        description: undefined,
        badgeText: undefined,
        card: shinhanCard,
    },
    registeredCards: [shinhanCard, samsungCard, kbCard],
    cardCombinations: [
        {
            type: 'SINGLE_BENEFIT',
            label: '대표카드',
            description: '가결제 진행',
            benefitDescription: '이 결제는 가결제로 먼저 진행돼요!',
            cards: [shinhanCard],
        },
    ],
};

export const mockPaymentCardSelectDataMap = {
    NORMAL: mockNormalPaymentCardSelectData,
    DUTCH_PAY: mockDutchPayPaymentCardSelectData,
} as const;

// [FE] 조보름 260531 14:50 | 일반 카드 선택 플로우 확인
export const mockPaymentCardSelectData = mockPaymentCardSelectDataMap.NORMAL;

// [FE] 조보름 260531 14:50 | 더치페이 카드 선택 플로우 확인
// export const mockPaymentCardSelectData = mockPaymentCardSelectDataMap.DUTCH_PAY;
