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
} from '../types/paymentCard.types';
import {
    preparePayment,
    subscribePaymentCardRecommendations,
} from '../api/paymentCardRecommendationApi';
import { toPaymentCardSelectData } from '../utils/paymentCardRecommendationAdapter';
import { createPaymentIdempotencyKey } from '../utils/paymentIdempotencyKey';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentCardSelect'>;

function PaymentCardSelectSkeleton() {
    return (
        <ScrollView
            className="flex-1"
            contentContainerClassName="px-4 pb-6 pt-6"
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

export default function PaymentCardSelectScreen({ navigation, route }: Props) {
    const routePaymentId = route.params?.paymentId;
    const paymentId =
        typeof routePaymentId === 'string'
            ? Number(routePaymentId)
            : routePaymentId;
    const routeAmount = route.params?.amount;
    const amount =
        typeof routeAmount === 'string'
            ? Number(routeAmount)
            : routeAmount;
    const hasValidPaymentId =
        typeof paymentId === 'number' && Number.isFinite(paymentId);
    const hasValidAmount = typeof amount === 'number' && Number.isFinite(amount);
    const idempotencyKey = useMemo(() => {
        if (!hasValidPaymentId) {
            return undefined;
        }

        return route.params?.idempotencyKey ?? createPaymentIdempotencyKey(paymentId);
    }, [hasValidPaymentId, paymentId, route.params?.idempotencyKey]);

    const [data, setData] = useState<PaymentCardSelectData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(
        hasValidPaymentId && hasValidAmount ? '' : '결제 정보가 없습니다.',
    );
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [pendingCardId, setPendingCardId] = useState<string | null>(null);
    const [selectedCombinationType, setSelectedCombinationType] =
        useState<CardCombinationType>('SINGLE_BENEFIT');
    const [isCombinationSelected, setIsCombinationSelected] = useState(false);
    const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
    const [stopModalVisible, setStopModalVisible] = useState(false);
    const isDutchPay = data?.flowType === 'DUTCH_PAY';

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

    const isSubmitDisabled =
        !data || (!selectedCardId && !isCombinationSelected);

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

    useEffect(() => {
        if (!hasValidPaymentId || !hasValidAmount || !idempotencyKey) {
            setData(null);
            setErrorMessage('결제 정보가 없습니다.');
            return;
        }

        let isMounted = true;

        const loadRecommendations = async () => {
            try {
                setIsLoading(true);
                setErrorMessage('');

                await preparePayment({
                    paymentId,
                    amount,
                    idempotencyKey,
                });

                const response = await subscribePaymentCardRecommendations(paymentId);
                const nextData = toPaymentCardSelectData(response);

                if (isMounted) {
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
    }, [amount, hasValidAmount, hasValidPaymentId, idempotencyKey, paymentId]);

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

        if (!hasValidPaymentId || !selectedCard || !idempotencyKey) {
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
            paymentId,
            cardId: Number(selectedCard.id),
            amount: selectedCard.amount,
            flow: isDutchPay ? 'DUTCH_PAY' : 'NORMAL',
            idempotencyKey,
        });
    };

    const handlePressSubmit = () => {
        if (!hasValidPaymentId || !selectedPaymentCard || !idempotencyKey) {
            return;
        }

        navigation.navigate('PaymentPin', {
            mode: 'PAYMENT_INPUT',
            paymentId,
            cardId: Number(selectedPaymentCard.id),
            amount: selectedPaymentCard.amount,
            flow: isDutchPay ? 'DUTCH_PAY' : 'NORMAL',
            idempotencyKey,
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
                                    · {data.cardCombinations[0]?.benefitDescription}
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
                        isDutchPay
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
