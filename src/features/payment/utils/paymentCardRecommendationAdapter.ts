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
    PaymentCardRecommendationResult,
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

const emptyCombinationStrategyTypeByType: Record<
    CardCombinationType,
    PaymentCardRecommendationStrategyType
> = {
    SINGLE_BENEFIT: 'BENEFIT_SINGLE',
    SINGLE_PERFORMANCE: 'PERF_SINGLE',
    SPLIT_BENEFIT: 'BENEFIT_SPLIT',
    SPLIT_PERFORMANCE: 'PERF_SPLIT',
};

const allCombinationTypes: CardCombinationType[] = [
    'SINGLE_BENEFIT',
    'SPLIT_BENEFIT',
    'SINGLE_PERFORMANCE',
    'SPLIT_PERFORMANCE',
];

const strategyDisplayOrder: PaymentCardRecommendationStrategyType[] = [
    'BENEFIT_SINGLE',
    'BENEFIT_SPLIT',
    'PERF_SINGLE',
    'PERF_SPLIT',
];

const benefitStrategyTypes: PaymentCardRecommendationStrategyType[] = [
    'BENEFIT_SINGLE',
    'BENEFIT_SPLIT',
];

const getSelectionDescription = (
    strategyType: PaymentCardRecommendationStrategyType,
    cards: PaymentCardRecommendationCard[],
): string => {
    if (benefitStrategyTypes.includes(strategyType)) {
        const discountAmount = cards.reduce(
            (total, card) => total + Math.max(card.discountAmount, 0),
            0,
        );

        return `이 카드로 결제시 ${discountAmount.toLocaleString()}원 할인`;
    }

    const performance = cards.reduce(
        (total, card) => ({
            expectedAmount:
                total.expectedAmount + Math.max(card.expectedPerformanceAmount, 0),
            targetAmount: total.targetAmount + Math.max(card.targetPerformanceAmount, 0),
        }),
        { expectedAmount: 0, targetAmount: 0 },
    );
    const achievementRate =
        performance.targetAmount > 0
            ? Math.max(
                  0,
                  Math.min(
                      Math.round(
                          (performance.expectedAmount / performance.targetAmount) * 100,
                      ),
                      100,
                  ),
              )
            : 0;

    return `이 카드로 결제시 실적 ${achievementRate}% 달성`;
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

const resolveCardImageUrl = (card: PaymentCardRecommendationCard): string => {
    const imageUrl =
        card.imageUrl ??
        card.image_url ??
        card.cardImageUrl ??
        card.card_image_url ??
        '';

    return imageUrl.trim();
};

const toPaymentCard = (card: PaymentCardRecommendationCard): PaymentCard => ({
    id: String(card.cardId),
    amount: card.amount,
    cardName: card.cardName,
    cardCompany: card.cardCompany,
    maskedNumber: card.maskedNumber,
    expiryDate: '',
    theme: getCardTheme(card.cardCompany),
    imageUrl: resolveCardImageUrl(card),
    benefitDescription: `${card.totalBenefitAmount.toLocaleString()}원 혜택`,
});

const getUniqueCards = (cards: PaymentCard[]): PaymentCard[] => {
    const cardMap = new Map<string, PaymentCard>();

    cards.forEach((card) => {
        cardMap.set(card.id, card);
    });

    return Array.from(cardMap.values());
};

const mergeRegisteredCardFallback = (
    card: PaymentCard,
    fallbackCardMap: Map<string, PaymentCard>,
): PaymentCard => {
    const fallbackCard = fallbackCardMap.get(card.id);

    if (!fallbackCard) {
        return card;
    }

    return {
        ...fallbackCard,
        ...card,
        imageUrl: card.imageUrl || fallbackCard.imageUrl,
        expiryDate: card.expiryDate || fallbackCard.expiryDate,
        isPrimary: card.isPrimary ?? fallbackCard.isPrimary,
    };
};

const toFallbackRegisteredCards = (
    fallbackRegisteredCards: PaymentCard[],
    paymentAmount: number,
) =>
    fallbackRegisteredCards.map((card) => ({
        ...card,
        amount: paymentAmount,
        benefitDescription: card.benefitDescription ?? '등록 카드로 결제합니다.',
    }));

const createEmptyCardCombinations = (): CardCombination[] =>
    allCombinationTypes.map((type) => ({
        type,
        strategyType: emptyCombinationStrategyTypeByType[type],
        label: combinationMeta[type].label,
        description: combinationMeta[type].description,
        cards: [],
    }));

const sortResultsByDisplayOrder = (
    results: PaymentCardRecommendationResult[],
): PaymentCardRecommendationResult[] => {
    return [...results].sort(
        (a, b) =>
            strategyDisplayOrder.indexOf(a.strategyType) -
            strategyDisplayOrder.indexOf(b.strategyType),
    );
};

export function toPaymentCardSelectData(
    response: PaymentCardRecommendationResponse,
    fallbackRegisteredCards: PaymentCard[] = [],
    paymentAmount = 0,
): PaymentCardSelectData {
    if (!response.results?.length) {
        if (!fallbackRegisteredCards.length) {
            throw new Error('추천 카드 결과가 없습니다.');
        }

        const registeredCards = toFallbackRegisteredCards(
            fallbackRegisteredCards,
            paymentAmount,
        );
        const cardCombinations = createEmptyCardCombinations();
        const primaryCard = registeredCards.find((card) => card.isPrimary) ?? registeredCards[0];

        return {
            flowType: 'NORMAL',
            recommendedCard: {
                title: '이룸페이가 추천해요!',
                badgeText: undefined,
                card: primaryCard,
                cards: primaryCard ? [primaryCard] : [],
            },
            registeredCards,
            cardCombinations,
        };
    }

    const fallbackCardMap = new Map(
        fallbackRegisteredCards.map((card) => [card.id, card]),
    );
    const orderedResults = sortResultsByDisplayOrder(response.results);
    const bestResult = response.results.find((result) => result.isBest);
    const combinations = orderedResults.map((result) => {
        const type = strategyTypeToCombinationType[result.strategyType];
        const meta = combinationMeta[type];
        const cards =
            result.cards
                ?.map(toPaymentCard)
                .map((card) => mergeRegisteredCardFallback(card, fallbackCardMap)) ??
            [];

        return {
            type,
            strategyType: result.strategyType,
            isBest: result.isBest,
            label: meta.label,
            description: meta.description,
            cards,
            benefitDescription: `${result.totalBenefitAmount.toLocaleString()}원 할인`,
            selectionDescription: getSelectionDescription(
                result.strategyType,
                result.cards ?? [],
            ),
        };
    });

    const recommendedRegisteredCards = getUniqueCards(
        orderedResults.flatMap((result) => result.cards?.map(toPaymentCard) ?? []),
    );
    const registeredCards =
        recommendedRegisteredCards.length > 0
            ? recommendedRegisteredCards
            : toFallbackRegisteredCards(fallbackRegisteredCards, paymentAmount);
    const recommendedCards =
        bestResult?.cards
            ?.map(toPaymentCard)
            .map((card) => mergeRegisteredCardFallback(card, fallbackCardMap)) ??
        [];
    const recommendedCard =
        recommendedCards[0] ??
        combinations.flatMap((combination) => combination.cards)[0] ??
        registeredCards.find((card) => card.isPrimary) ??
        registeredCards[0];

    if (!recommendedCard) {
        throw new Error('추천 카드 정보가 없습니다.');
    }

    return {
        flowType: 'NORMAL',
        recommendedCard: {
            title: '이룸페이가 추천해요!',
            badgeText: 'BEST',
            card: recommendedCard,
            cards: recommendedCards.length > 0 ? recommendedCards : [recommendedCard],
        },
        registeredCards,
        cardCombinations: combinations,
    };
}
