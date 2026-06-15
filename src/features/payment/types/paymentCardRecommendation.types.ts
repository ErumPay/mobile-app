export type PaymentCardRecommendationStrategyType =
    | 'BENEFIT_SINGLE'
    | 'PERF_SINGLE'
    | 'BENEFIT_SPLIT'
    | 'PERF_SPLIT';

export type PaymentCardRecommendationCard = {
    cardId: number;
    cardProductId: number;
    cardCompany: string;
    cardName: string;
    imageUrl?: string | null;
    image_url?: string | null;
    cardImageUrl?: string | null;
    card_image_url?: string | null;
    maskedNumber: string;
    amount: number;
    discountAmount: number;
    cashbackAmount: number;
    mileageAmount: number;
    totalBenefitAmount: number;
    currentPerformanceAmount: number;
    targetPerformanceAmount: number;
    remainingToTarget: number;
    expectedPerformanceAmount: number;
    willReachTarget: boolean;
    warnings: string[];
};

export type PaymentCardRecommendationResult = {
    strategyType: PaymentCardRecommendationStrategyType;
    isBest?: boolean;
    totalBenefitAmount: number;
    cards: PaymentCardRecommendationCard[];
    reason: string | null;
};

export type PaymentCardRecommendationResponse = {
    paymentId: number;
    recommendedAt: string;
    results: PaymentCardRecommendationResult[];
};
