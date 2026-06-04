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
    const routeFlow = route.params?.flow ?? 'NORMAL';
    const isDutchPayRoute = routeFlow === 'DUTCH_PAY';
    const isDutchFinalRoute = routeFlow === 'DUTCH_PAY_FINAL';
    const isRemotePaymentRoute = routeFlow === 'REMOTE_PAYMENT';
    const hasValidDutchSessionId =
        typeof route.params?.dutchSessionId === 'number' &&
        Number.isFinite(route.params.dutchSessionId);
    const canPreparePayment =
        hasValidAmount &&
        (hasValidPaymentId ||
            (hasValidDutchSessionId && (isDutchPayRoute || isDutchFinalRoute)));
    const idempotencyKey = useMemo(() => {
        if (!canPreparePayment) {
            return undefined;
        }

        return (
            route.params?.idempotencyKey ??
            createPaymentIdempotencyKey(paymentId ?? route.params?.dutchSessionId ?? 0)
        );
    }, [
        canPreparePayment,
        paymentId,
        route.params?.dutchSessionId,
        route.params?.idempotencyKey,
    ]);
    const [dutchSessionId, setDutchSessionId] = useState(
        route.params?.dutchSessionId,
    );
    const [preparedPaymentId, setPreparedPaymentId] = useState(paymentId);

    const [data, setData] = useState<PaymentCardSelectData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(
        canPreparePayment ? '' : '寃곗젣 ?뺣낫媛 ?놁뒿?덈떎.',
    );
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [pendingCardId, setPendingCardId] = useState<string | null>(null);
    const [selectedCombinationType, setSelectedCombinationType] =
        useState<CardCombinationType>('SINGLE_BENEFIT');
    const [isCombinationSelected, setIsCombinationSelected] = useState(false);
    const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
    const [stopModalVisible, setStopModalVisible] = useState(false);
    const paymentFlow = data?.flowType ?? routeFlow;
    const isDutchPay =
        paymentFlow === 'DUTCH_PAY' || paymentFlow === 'DUTCH_PAY_FINAL';
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
        if (!canPreparePayment || !idempotencyKey) {
            setData(null);
            setErrorMessage('寃곗젣 ?뺣낫媛 ?놁뒿?덈떎.');
            return;
        }

        let isMounted = true;

        const loadRecommendations = async () => {
            try {
                setIsLoading(true);
                setErrorMessage('');

                const prepareResponse = await preparePayment({
                    paymentId,
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
                    sessionId: route.params?.dutchSessionId,
                    orderName: route.params?.orderName,
                    merchantId: route.params?.merchantId,
                });

                const response = await subscribePaymentCardRecommendations(prepareResponse.paymentId);
                const nextData = {
                    ...toPaymentCardSelectData(response),
                    flowType: isDutchFinalRoute
                        ? 'DUTCH_PAY_FINAL'
                        : isDutchPayRoute
                            ? 'DUTCH_PAY'
                            : isRemotePaymentRoute
                                ? 'REMOTE_PAYMENT'
                                : 'NORMAL',
                } as PaymentCardSelectData;

                if (isMounted) {
                    setDutchSessionId(prepareResponse.dutchSessionId ?? route.params?.dutchSessionId);
                    setPreparedPaymentId(prepareResponse.paymentId);
                    setData(nextData);
                }
            } catch (error) {
                if (isMounted) {
                    setData(null);
                    setErrorMessage(
                        error instanceof Error
                            ? error.message
                            : '寃곗젣 移대뱶 異붿쿇 ?뺣낫瑜?遺덈윭?ㅼ? 紐삵뻽?듬땲??',
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
        paymentId,
        route.params?.dutchSessionId,
        route.params?.merchantId,
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

        if (!hasPreparedPaymentId || !selectedCard || !idempotencyKey) {
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
            flow: paymentFlow,
            idempotencyKey,
            dutchSessionId,
            selectedUserIds: route.params?.selectedUserIds,
            splitMethod: route.params?.splitMethod,
            orderName: route.params?.orderName,
            merchantId: route.params?.merchantId,
        });
    };

    const handlePressSubmit = () => {
        if (!hasPreparedPaymentId || !selectedPaymentCard || !idempotencyKey) {
            return;
        }

        navigation.navigate('PaymentPin', {
            mode: 'PAYMENT_INPUT',
            paymentId: preparedPaymentId,
            cardId: Number(selectedPaymentCard.id),
            amount: selectedPaymentCard.amount,
            flow: paymentFlow,
            idempotencyKey,
            dutchSessionId,
            selectedUserIds: route.params?.selectedUserIds,
            splitMethod: route.params?.splitMethod,
            orderName: route.params?.orderName,
            merchantId: route.params?.merchantId,
        });
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <View className="flex-1 bg-neutral-white">
                <Header
                    title="寃곗젣 移대뱶 ?좏깮"
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
                            actionLabel={isDutchPay ? '?ㅻⅨ 寃곗젣 移대뱶 ?좏깮' : undefined}
                            onPress={handlePressRecommendedCard}
                            onPressAction={isDutchPay ? handleOpenBottomSheet : undefined}
                        />

                        {isDutchPay ? (
                            <View className="mt-2">
                                <Text className="text-small-regular text-neutral-black2">
                                    쨌 {data.cardCombinations[0]?.benefitDescription}
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
                        isDutchPay ? '??寃곗젣??媛寃곗젣濡?癒쇱? 吏꾪뻾?쇱슂!' : undefined
                    }
                />
                <PaymentStopConfirmModal
                    visible={stopModalVisible}
                    description={
                        isDutchPay || isRemotePayment
                            ? '以묒??섏뀛??硫붿씤?먯꽌 寃곗젣 吏꾪뻾?곹깭瑜??뺤씤?????덉뒿?덈떎.'
                            : undefined
                    }
                    onConfirm={handleConfirmStopPayment}
                    onCancel={() => setStopModalVisible(false)}
                />
            </View>
        </SafeAreaView>
    );
}
