import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import Header from '../../../shared/components/Header/Header';
import type { RootStackParamList } from '../../../../App';
import RecommendedCardSection from '../components/RecommendedCardSection';
import CardCombinationSection from '../components/CardCombinationSection';
import RegisteredCardBottomSheet from '../components/RegisteredCardBottomSheet';
import PaymentCardActionButton from '../components/PaymentCardActionButton';
import PaymentStopConfirmModal from '../components/PaymentStopConfirmModal';
import { Skeleton } from '../../../shared/components/Skeleton';
import type {
    CardCombinationType,
    PaymentCard,
    PaymentCardSelectData,
    PaymentCardFlowType,
} from '../types/paymentCard.types';
import {
    preparePayment,
    subscribePaymentCardRecommendations,
} from '../api/paymentCardRecommendationApi';
import { toPaymentCardSelectData } from '../utils/paymentCardRecommendationAdapter';
import { createPaymentIdempotencyKey } from '../utils/paymentIdempotencyKey';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentCardSelect'>;

function toFiniteNumber(value: unknown) {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : undefined;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
        const parsedValue = Number(value);

        return Number.isFinite(parsedValue) ? parsedValue : undefined;
    }

    return undefined;
}

function PaymentCardSelectSkeleton() {
    return (
        <ScrollView
            className="flex-1"
            contentContainerClassName="px-4 pb-36 pt-6"
            showsVerticalScrollIndicator={false}
        >
            <View className="rounded-lg border border-neutral-grey1 bg-neutral-white p-4">
                <Skeleton width="42%" height={14} />
                <View className="mt-3">
                    <Skeleton width="64%" height={18} />
                </View>
                <View className="mt-5">
                    <Skeleton height={148} rounded="lg" />
                </View>
                <View className="mt-5 gap-2">
                    <Skeleton width="78%" height={14} />
                    <Skeleton width="48%" height={14} />
                </View>
            </View>

            <View className="mt-6 gap-3">
                <Skeleton width="36%" height={18} />
                <Skeleton height={64} rounded="lg" />
                <Skeleton height={64} rounded="lg" />
                <Skeleton height={64} rounded="lg" />
            </View>
        </ScrollView>
    );
}

function applyPaymentCardFlowUi(
    data: PaymentCardSelectData,
    flowType: PaymentCardFlowType,
): PaymentCardSelectData {
    if (flowType === 'DUTCH_PAY') {
        return {
            ...data,
            flowType,
            recommendedCard: {
                ...data.recommendedCard,
                title: '대표카드로 결제합니다',
                description: undefined,
                badgeText: undefined,
                card: {
                    ...data.recommendedCard.card,
                    isPrimary: true,
                },
            },
            cardCombinations: data.cardCombinations.map((combination, index) =>
                index === 0
                    ? {
                        ...combination,
                        label: '대표카드',
                        description: '가결제 진행',
                        benefitDescription: '이 결제는 가결제로 먼저 진행돼요!',
                    }
                    : combination,
            ),
        };
    }

    if (flowType === 'DUTCH_PAY_FINAL') {
        return {
            ...data,
            flowType,
        };
    }

    if (flowType === 'REMOTE_PAYMENT') {
        return {
            ...data,
            flowType,
            recommendedCard: {
                ...data.recommendedCard,
                title: '원격결제 카드를 선택해주세요',
                badgeText: undefined,
            },
        };
    }

    return {
        ...data,
        flowType,
    };
}

export default function PaymentCardSelectScreen({ navigation, route }: Props) {
    const paymentId = toFiniteNumber(route.params?.paymentId);
    const remoteRequestId = toFiniteNumber(route.params?.remoteRequestId);
    const amount = toFiniteNumber(route.params?.amount);
    const routeDutchSessionId = toFiniteNumber(route.params?.dutchSessionId);
    const merchantId = toFiniteNumber(route.params?.merchantId);
    const hasValidPaymentId =
        typeof paymentId === 'number' && Number.isFinite(paymentId);
    const hasValidAmount = typeof amount === 'number' && Number.isFinite(amount);
    const routeFlow = route.params?.flow ?? 'NORMAL';
    const isDutchPayRoute = routeFlow === 'DUTCH_PAY';
    const isDutchFinalRoute = routeFlow === 'DUTCH_PAY_FINAL';
    const isRemotePaymentRoute = routeFlow === 'REMOTE_PAYMENT';
    const hasValidRemoteRequestId =
        typeof remoteRequestId === 'number' && Number.isFinite(remoteRequestId);
    const hasValidDutchSessionId =
        typeof routeDutchSessionId === 'number' &&
        Number.isFinite(routeDutchSessionId);
    const canPreparePayment =
        hasValidAmount &&
        (hasValidPaymentId ||
            (hasValidRemoteRequestId && isRemotePaymentRoute) ||
            (hasValidDutchSessionId && (isDutchPayRoute || isDutchFinalRoute)));
    const idempotencyKey = useMemo(() => {
        if (!canPreparePayment) {
            return undefined;
        }

        return (
            route.params?.idempotencyKey ??
            createPaymentIdempotencyKey(paymentId ?? remoteRequestId ?? routeDutchSessionId ?? 0)
        );
    }, [
        canPreparePayment,
        paymentId,
        remoteRequestId,
        routeDutchSessionId,
        route.params?.idempotencyKey,
    ]);
    const [dutchSessionId, setDutchSessionId] = useState(routeDutchSessionId);
    const [preparedPaymentId, setPreparedPaymentId] = useState(paymentId);

    const [data, setData] = useState<PaymentCardSelectData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(
        canPreparePayment ? '' : '결제 정보가 없습니다.',
    );
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [pendingCardId, setPendingCardId] = useState<string | null>(null);
    const [selectedCombinationType, setSelectedCombinationType] =
        useState<CardCombinationType>('SINGLE_BENEFIT');
    const [isCombinationSelected, setIsCombinationSelected] = useState(false);
    const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
    const [stopModalVisible, setStopModalVisible] = useState(false);
    const paymentFlow = data?.flowType ?? routeFlow;
    const isDutchPay = paymentFlow === 'DUTCH_PAY';
    const isRemotePayment = paymentFlow === 'REMOTE_PAYMENT';
    const hasPreparedPaymentId =
        typeof preparedPaymentId === 'number' && Number.isFinite(preparedPaymentId);

    const selectedCombination = useMemo(
        () =>
            data?.cardCombinations.find(
                (combination) => combination.type === selectedCombinationType,
            ) ?? data?.cardCombinations[0],
        [data?.cardCombinations, selectedCombinationType],
    );

    const displayedRecommendedCard = data?.recommendedCard;

    const isRecommendedSelected =
        !!displayedRecommendedCard?.card &&
        selectedCardId === displayedRecommendedCard.card.id;

    const selectedPaymentCard = useMemo<PaymentCard | null>(() => {
        if (!data) {
            return null;
        }

        if (selectedCardId) {
            return (
                data.registeredCards.find((card) => card.id === selectedCardId) ??
                displayedRecommendedCard?.card ??
                null
            );
        }

        if (isCombinationSelected) {
            return selectedCombination?.cards[0] ?? null;
        }

        return null;
    }, [
        data,
        displayedRecommendedCard?.card,
        isCombinationSelected,
        selectedCardId,
        selectedCombination?.cards,
    ]);
    const selectedPaymentCombination = useMemo(() => {
        if (!data) {
            return null;
        }

        if (isCombinationSelected && selectedCombination) {
            return selectedCombination;
        }

        if (!selectedPaymentCard) {
            return null;
        }

        const recommendedCombination = data.cardCombinations[0];

        if (
            recommendedCombination &&
            displayedRecommendedCard?.card &&
            selectedPaymentCard.id === displayedRecommendedCard.card.id
        ) {
            return recommendedCombination;
        }

        return data.cardCombinations.find((combination) =>
            combination.cards.length === 1 &&
            combination.cards[0]?.id === selectedPaymentCard.id &&
            combination.cards[0]?.amount === selectedPaymentCard.amount
        ) ?? null;
    }, [
        data,
        displayedRecommendedCard?.card,
        isCombinationSelected,
        selectedCombination,
        selectedPaymentCard,
    ]);
    const selectedPaymentCards = useMemo(
        () =>
            selectedPaymentCombination?.cards.map((card) => ({
                cardId: Number(card.id),
                amount: card.amount,
            })) ?? [],
        [selectedPaymentCombination?.cards],
    );
    const selectedStrategyType = selectedPaymentCombination?.strategyType;
    const isSubmitDisabled =
        !data ||
        (!selectedCardId && !isCombinationSelected) ||
        !selectedStrategyType ||
        !selectedPaymentCards.length;

    useEffect(() => {
        if (!canPreparePayment || !idempotencyKey) {
            setData(null);
            setErrorMessage('결제 정보가 없습니다.');
            return;
        }

        let isMounted = true;

        const loadRecommendations = async () => {
            try {
                setIsLoading(true);
                setErrorMessage('');

                const prepareResponse = await preparePayment({
                    paymentId,
                    remoteRequestId: isRemotePaymentRoute ? remoteRequestId : undefined,
                    amount,
                    idempotencyKey,
                    paymentType: isDutchPayRoute || isDutchFinalRoute
                        ? 'DUTCH'
                        : isRemotePaymentRoute
                            ? 'REMOTE'
                            : 'SINGLE',
                    dutchRole: hasValidPaymentId
                        ? undefined
                        : isDutchFinalRoute
                            ? 'HOST'
                            : isDutchPayRoute
                                ? 'MEMBER'
                                : undefined,
                    sessionId: routeDutchSessionId,
                    orderName: route.params?.orderName,
                    merchantId,
                });

                const response = await subscribePaymentCardRecommendations(prepareResponse.paymentId);

                const nextFlowType = isDutchFinalRoute
                    ? 'DUTCH_PAY_FINAL'
                    : isDutchPayRoute
                        ? 'DUTCH_PAY'
                        : isRemotePaymentRoute
                            ? 'REMOTE_PAYMENT'
                            : 'NORMAL';
                const nextData = applyPaymentCardFlowUi(
                    toPaymentCardSelectData(response),
                    nextFlowType,
                );

                if (isMounted) {
                    setDutchSessionId(prepareResponse.dutchSessionId ?? routeDutchSessionId);
                    setPreparedPaymentId(prepareResponse.paymentId);
                    setData(nextData);
                }
            } catch (error) {
                if (isMounted) {
                    setData(null);
                    setErrorMessage(
                        error instanceof Error
                            ? error.message
                            : '결제 카드 추천 정보를 불러오지 못했습니다.',
                    );
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void loadRecommendations();

        return () => {
            isMounted = false;
        };
    }, [
        amount,
        canPreparePayment,
        hasValidPaymentId,
        idempotencyKey,
        isDutchFinalRoute,
        isDutchPayRoute,
        isRemotePaymentRoute,
        merchantId,
        paymentId,
        remoteRequestId,
        routeDutchSessionId,
        route.params?.orderName,
    ]);

    const handlePressClose = () => {
        setStopModalVisible(true);
    };

    const handleConfirmStopPayment = () => {
        setStopModalVisible(false);

        if (navigation.canGoBack()) {
            navigation.goBack();
            return;
        }

        navigation.navigate('Main');
    };

    const handlePressRecommendedCard = () => {
        if (!displayedRecommendedCard) {
            return;
        }

        setSelectedCardId(displayedRecommendedCard.card.id);
        setPendingCardId(null);
        setIsCombinationSelected(false);
    };

    const handleSelectCombinationType = (type: CardCombinationType) => {
        setSelectedCombinationType(type);
        setIsCombinationSelected(false);
    };

    const handleToggleCombination = () => {
        if (!selectedCombination) {
            return;
        }

        setIsCombinationSelected((prev) => !prev);
        setSelectedCardId(null);
        setPendingCardId(null);
    };

    const handleOpenBottomSheet = () => {
        setPendingCardId(null);
        setIsBottomSheetVisible(true);
    };

    const handleSelectBottomSheetCard = (cardId: string) => {
        setPendingCardId(cardId);
    };

    const handleCloseBottomSheet = () => {
        setPendingCardId(null);
        setIsBottomSheetVisible(false);
    };

    const handleSubmitBottomSheet = () => {
        if (!pendingCardId) {
            return;
        }

        const selectedCard = data?.registeredCards.find(
            (card) => card.id === pendingCardId,
        );
        const selectedCombinationForCard = data?.cardCombinations.find((combination) =>
            combination.cards.length === 1 &&
            combination.cards[0]?.id === selectedCard?.id &&
            combination.cards[0]?.amount === selectedCard?.amount
        );

        if (
            !hasPreparedPaymentId ||
            !selectedCard ||
            !selectedCombinationForCard ||
            !idempotencyKey
        ) {
            return;
        }

        if (!isDutchPay) {
            setSelectedCardId(pendingCardId);
            setIsCombinationSelected(false);
        }

        setPendingCardId(null);
        setIsBottomSheetVisible(false);

        navigation.navigate('PaymentPin', {
            mode: 'PAYMENT_INPUT',
            paymentId: preparedPaymentId,
            cardId: Number(selectedCard.id),
            amount: selectedCard.amount,
            strategyType: selectedCombinationForCard.strategyType,
            cards: selectedCombinationForCard.cards.map((card) => ({
                cardId: Number(card.id),
                amount: card.amount,
            })),
            flow: paymentFlow,
            idempotencyKey,
            remoteRequestId,
            dutchSessionId,
            selectedUserIds: route.params?.selectedUserIds,
            splitMethod: route.params?.splitMethod,
            orderName: route.params?.orderName,
            merchantId,
        });
    };

    const handlePressSubmit = () => {
        if (
            !hasPreparedPaymentId ||
            !selectedPaymentCard ||
            !selectedStrategyType ||
            !selectedPaymentCards.length ||
            !idempotencyKey
        ) {
            return;
        }

        navigation.navigate('PaymentPin', {
            mode: 'PAYMENT_INPUT',
            paymentId: preparedPaymentId,
            cardId: Number(selectedPaymentCard.id),
            amount: selectedPaymentCards.reduce((sum, card) => sum + card.amount, 0),
            strategyType: selectedStrategyType,
            cards: selectedPaymentCards,
            flow: paymentFlow,
            idempotencyKey,
            remoteRequestId,
            dutchSessionId,
            selectedUserIds: route.params?.selectedUserIds,
            splitMethod: route.params?.splitMethod,
            orderName: route.params?.orderName,
            merchantId,
        });
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <View className="flex-1 bg-neutral-white">
                <Header
                    title="결제 카드 선택"
                    type="close"
                    onPressRight={handlePressClose}
                />

                <View className="h-px bg-neutral-grey1" />

                {errorMessage ? (
                    <Text className="px-4 pt-4 font-pretendard text-normal-regular text-state-error">
                        {errorMessage}
                    </Text>
                ) : null}

                {isLoading ? <PaymentCardSelectSkeleton /> : null}

                {data && displayedRecommendedCard && selectedCombination ? (
                    <ScrollView
                        className="flex-1"
                        contentContainerClassName="px-4 pb-6 pt-6"
                        showsVerticalScrollIndicator={false}
                    >
                        <RecommendedCardSection
                            recommendedCard={displayedRecommendedCard}
                            selected={isRecommendedSelected}
                            showBenefitDescription={!isDutchPay}
                            actionLabel={isDutchPay ? '다른 결제 카드 선택' : undefined}
                            onPress={handlePressRecommendedCard}
                            onPressAction={isDutchPay ? handleOpenBottomSheet : undefined}
                        />

                        {isDutchPay ? (
                            <View className="mt-2">
                                <Text className="text-small-regular text-neutral-black2">
                                    • {data.cardCombinations[0]?.benefitDescription}
                                </Text>
                            </View>
                        ) : (
                            <CardCombinationSection
                                combinations={data.cardCombinations}
                                selectedType={selectedCombinationType}
                                selectedCombination={selectedCombination}
                                selected={isCombinationSelected}
                                onSelectType={handleSelectCombinationType}
                                onToggleSelect={handleToggleCombination}
                                onOpenBottomSheet={handleOpenBottomSheet}
                            />
                        )}
                    </ScrollView>
                ) : null}

                <View className="border-t border-neutral-grey1 bg-neutral-white px-4 pb-5 pt-3">
                    <PaymentCardActionButton
                        disabled={isSubmitDisabled}
                        onPress={handlePressSubmit}
                    />
                </View>

                <RegisteredCardBottomSheet
                    visible={isBottomSheetVisible}
                    cards={data?.registeredCards ?? []}
                    selectedCardId={pendingCardId}
                    onSelectCard={handleSelectBottomSheetCard}
                    onClose={handleCloseBottomSheet}
                    onPressSubmit={handleSubmitBottomSheet}
                    submitDisabled={!pendingCardId}
                    notice={
                        isDutchPay ? '이 결제는 가결제로 먼저 진행돼요!' : undefined
                    }
                />
                <PaymentStopConfirmModal
                    visible={stopModalVisible}
                    description={
                        isDutchPay || isRemotePayment
                            ? '중지하셔도 메인에서 결제 진행상태를 확인할 수 있습니다.'
                            : undefined
                    }
                    onConfirm={handleConfirmStopPayment}
                    onCancel={() => setStopModalVisible(false)}
                />
            </View>
        </SafeAreaView>
    );
}
