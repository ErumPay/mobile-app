import type {
    CardCombination,
    CardCombinationType,
    PaymentCard,
    PaymentCardSelectData,
    PaymentCardTheme,
} from '../types/paymentCard.types';
import type {
    PaymentCardRecommendationCard,
    PaymentCardRecommendationResponse,
    PaymentCardRecommendationStrategyType,
} from '../types/paymentCardRecommendation.types';

const strategyTypeToCombinationType: Record<
    PaymentCardRecommendationStrategyType,
    CardCombinationType
> = {
    BENEFIT_SINGLE: 'SINGLE_BENEFIT',
    PERF_SINGLE: 'SINGLE_PERFORMANCE',
    BENEFIT_SPLIT: 'SPLIT_BENEFIT',
    PERF_SPLIT: 'SPLIT_PERFORMANCE',
};

const combinationMeta: Record<
    CardCombinationType,
    Pick<CardCombination, 'label' | 'description'>
> = {
    SINGLE_BENEFIT: {
        label: '단일혜택',
        description: '혜택 최대화',
    },
    SINGLE_PERFORMANCE: {
        label: '단일실적',
        description: '실적 채우기',
    },
    SPLIT_BENEFIT: {
        label: '분할혜택',
        description: '혜택 최대화',
    },
    SPLIT_PERFORMANCE: {
        label: '분할실적',
        description: '실적 채우기',
    },
};

const getCardTheme = (cardCompany: string): PaymentCardTheme => {
    if (cardCompany.includes('삼성')) {
        return 'BLUE';
    }

    if (cardCompany.includes('KB') || cardCompany.includes('국민')) {
        return 'ORANGE';
    }

    return 'PURPLE';
};

const toPaymentCard = (card: PaymentCardRecommendationCard): PaymentCard => ({
    id: String(card.cardId),
    amount: card.amount,
    cardName: card.cardName,
    cardCompany: card.cardCompany,
    maskedNumber: card.maskedNumber,
    expiryDate: '',
    theme: getCardTheme(card.cardCompany),
    imageUrl: '',
    benefitDescription: `${card.totalBenefitAmount.toLocaleString()}원 혜택`,
});

const getUniqueCards = (cards: PaymentCard[]): PaymentCard[] => {
    const cardMap = new Map<string, PaymentCard>();

    cards.forEach((card) => {
        cardMap.set(card.id, card);
    });

    return Array.from(cardMap.values());
};

export function toPaymentCardSelectData(
    response: PaymentCardRecommendationResponse,
): PaymentCardSelectData {
    if (!response.results?.length) {
        throw new Error('추천 카드 결과가 없습니다.');
    }

    const combinations = response.results.map((result) => {
        const type = strategyTypeToCombinationType[result.strategyType];
        const meta = combinationMeta[type];
        const cards = result.cards?.map(toPaymentCard) ?? [];

        return {
            type,
            strategyType: result.strategyType,
            label: meta.label,
            description: meta.description,
            cards,
            benefitDescription: `${result.totalBenefitAmount.toLocaleString()}원 혜택`,
        };
    });

    const registeredCards = getUniqueCards(
        response.results.flatMap((result) => result.cards?.map(toPaymentCard) ?? []),
    );
    const recommendedCard = combinations[0]?.cards[0] ?? registeredCards[0];

    if (!recommendedCard) {
        throw new Error('추천 카드 정보가 없습니다.');
    }

    return {
        flowType: 'NORMAL',
        recommendedCard: {
            title: '이룸페이가 추천해요!',
            badgeText: 'BEST',
            card: recommendedCard,
        },
        registeredCards,
        cardCombinations: combinations,
    };
}
