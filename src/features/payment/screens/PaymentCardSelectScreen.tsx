import { useMemo, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import Header from '../../../shared/components/Header/Header';
import type { RootStackParamList } from '../../../../App';
import RecommendedCardSection from '../components/RecommendedCardSection';
import CardCombinationSection from '../components/CardCombinationSection';
import RegisteredCardBottomSheet from '../components/RegisteredCardBottomSheet';
import PaymentCardActionButton from '../components/PaymentCardActionButton';
import { mockPaymentCardSelectData } from '../constants/paymentCard.mock';
import type { CardCombinationType } from '../types/paymentCard.types';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentCardSelect'>;

export default function PaymentCardSelectScreen({ navigation }: Props) {
    const data = mockPaymentCardSelectData;
    const isDutchPay = data.flowType === 'DUTCH_PAY';

    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [pendingCardId, setPendingCardId] = useState<string | null>(null);
    const [selectedCombinationType, setSelectedCombinationType] =
        useState<CardCombinationType>('SINGLE_BENEFIT');
    const [isCombinationSelected, setIsCombinationSelected] = useState(false);
    const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

    const selectedCombination = useMemo(
        () =>
            data.cardCombinations.find(
                (combination) => combination.type === selectedCombinationType,
            ) ?? data.cardCombinations[0],
        [data.cardCombinations, selectedCombinationType],
    );

    const selectedRegisteredCard = useMemo(
        () => data.registeredCards.find((card) => card.id === selectedCardId),
        [data.registeredCards, selectedCardId],
    );

    const displayedRecommendedCard = useMemo(() => {
        if (isDutchPay && selectedRegisteredCard) {
            return {
                ...data.recommendedCard,
                card: selectedRegisteredCard,
            };
        }

        return data.recommendedCard;
    }, [data.recommendedCard, isDutchPay, selectedRegisteredCard]);

    const isRecommendedSelected =
        selectedCardId === displayedRecommendedCard.card.id;

    const isSubmitDisabled = !selectedCardId && !isCombinationSelected;

    const handlePressClose = () => {
        navigation.goBack();
    };

    const handlePressRecommendedCard = () => {
        setSelectedCardId(displayedRecommendedCard.card.id);
        setPendingCardId(null);
        setIsCombinationSelected(false);
    };

    const handleSelectCombinationType = (type: CardCombinationType) => {
        setSelectedCombinationType(type);
        setIsCombinationSelected(false);
    };

    const handleToggleCombination = () => {
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

        setSelectedCardId(pendingCardId);
        setPendingCardId(null);
        setIsCombinationSelected(false);
        setIsBottomSheetVisible(false);
    };

    const handlePressSubmit = () => {
        Alert.alert('간편비밀번호', '간편비밀번호 입력 화면으로 이동합니다.');
    };

    return (
        <View className="flex-1 bg-neutral-white">
            <Header
                title="결제 카드 선택"
                type="close"
                onPressRight={handlePressClose}
            />

            <View className="h-px bg-neutral-grey1" />

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

            <View className="border-t border-neutral-grey1 bg-neutral-white px-4 pb-5 pt-3">
                <PaymentCardActionButton
                    disabled={isSubmitDisabled}
                    onPress={handlePressSubmit}
                />
            </View>

            <RegisteredCardBottomSheet
                visible={isBottomSheetVisible}
                cards={data.registeredCards}
                selectedCardId={pendingCardId}
                onSelectCard={handleSelectBottomSheetCard}
                onClose={handleCloseBottomSheet}
                onPressSubmit={handleSubmitBottomSheet}
                submitDisabled={!pendingCardId}
                notice={
                    isDutchPay ? '이 결제는 가결제로 먼저 진행돼요!' : undefined
                }
            />
        </View>
    );
}