export type PaymentCardFlowType = 'NORMAL' | 'DUTCH_PAY' | 'REMOTE_PAYMENT';

export type CardCombinationType =
    | 'SINGLE_BENEFIT'
    | 'SINGLE_PERFORMANCE'
    | 'SPLIT_BENEFIT'
    | 'SPLIT_PERFORMANCE';

export type PaymentCardTheme = 'BLUE' | 'ORANGE' | 'PURPLE';

export type PaymentCardImageOrientation = 'HORIZONTAL' | 'VERTICAL';

export type PaymentCard = {
    id: string;
    amount: number;
    cardName: string;
    cardCompany: string;
    maskedNumber: string;
    expiryDate: string;
    theme: PaymentCardTheme;
    imageUrl: string;
    imageOrientation?: PaymentCardImageOrientation;
    benefitDescription?: string;
    isPrimary?: boolean;
};

export type RecommendedPaymentCard = {
    title: string;
    description?: string;
    badgeText?: string;
    card: PaymentCard;
};

export type CardCombination = {
    type: CardCombinationType;
    label: string;
    description: string;
    cards: PaymentCard[];
    benefitDescription?: string;
};

export type PaymentCardSelectData = {
    flowType: PaymentCardFlowType;
    recommendedCard: RecommendedPaymentCard;
    registeredCards: PaymentCard[];
    cardCombinations: CardCombination[];
};
