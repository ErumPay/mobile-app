import { ScrollView, Text, View } from 'react-native';

import { DraggableBottomSheet } from '../../../shared/components/BottomSheet';
import PaymentCardActionButton from './PaymentCardActionButton';
import RegisteredCardListItem from './RegisteredCardListItem';
import type { PaymentCard } from '../types/paymentCard.types';

type Props = {
    visible: boolean;
    cards: PaymentCard[];
    selectedCardId: string | null;
    onSelectCard: (cardId: string) => void;
    onClose: () => void;
    onPressSubmit: () => void;
    submitDisabled: boolean;
    notice?: string;
};

export default function RegisteredCardBottomSheet({
                                                      visible,
                                                      cards,
                                                      selectedCardId,
                                                      onSelectCard,
                                                      onClose,
                                                      onPressSubmit,
                                                      submitDisabled,
                                                      notice,
                                                  }: Props) {
    return (
        <DraggableBottomSheet
            visible={visible}
            onClose={onClose}
            initialRatio={0.55}
            expandedRatio={0.82}
        >
            <View className="flex-1">
                <Text className="text-heading-2 text-neutral-black1">
                    등록된 카드 전체
                </Text>

                <Text className="mt-2 text-small-regular text-neutral-black2">
                    총 {cards.length}개 카드
                </Text>

                {notice && (
                    <Text className="mt-5 text-small-regular text-erum-main">
                        · {notice}
                    </Text>
                )}

                <ScrollView
                    className="mt-5"
                    showsVerticalScrollIndicator={false}
                >
                    {cards.map((card) => (
                        <RegisteredCardListItem
                            key={card.id}
                            card={card}
                            selected={card.id === selectedCardId}
                            onPress={() => onSelectCard(card.id)}
                        />
                    ))}
                </ScrollView>

                <View className="mt-auto pt-4">
                    <PaymentCardActionButton
                        disabled={submitDisabled}
                        onPress={onPressSubmit}
                    />
                </View>
            </View>
        </DraggableBottomSheet>
    );
}