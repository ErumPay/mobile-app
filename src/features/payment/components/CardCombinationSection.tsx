import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import PaymentCardPreview from './PaymentCardPreview';
import CardCombinationTabs from './CardCombinationTabs';
import NoticeBox from '../../../shared/components/NoticeBox';
import type { CardCombination, CardCombinationType } from '../types/paymentCard.types';

type Props = {
    combinations: CardCombination[];
    selectedType: CardCombinationType;
    selectedCombination: CardCombination;
    selected: boolean;
    onSelectType: (type: CardCombinationType) => void;
    onToggleSelect: () => void;
    onOpenBottomSheet: () => void;
};

export default function CardCombinationSection({
                                                   combinations,
                                                   selectedType,
                                                   selectedCombination,
                                                   selected,
                                                   onSelectType,
                                                   onToggleSelect,
                                                   onOpenBottomSheet,
                                               }: Props) {
    const hasCards = selectedCombination.cards.length > 0;
    const selectionDescription =
        selectedCombination.selectionDescription ??
        selectedCombination.benefitDescription;

    return (
        <View className="mt-7 border-t border-neutral-grey1 pt-7">
            <View className="flex-row items-center justify-between gap-3">
                <Text className="flex-1 text-heading-3 text-neutral-black1">
                    추천 카드 조합 보기
                </Text>

                <Pressable
                    onPress={onOpenBottomSheet}
                    className="flex-row items-center rounded-lg border border-neutral-grey1 px-3 py-2"
                >
                    <Feather name="list" size={14} color="#1D1F1F" />
                    <Text className="ml-1 text-small-bold text-neutral-black1">
                        다른 결제 카드 선택
                    </Text>
                </Pressable>
            </View>

            <CardCombinationTabs
                combinations={combinations}
                selectedType={selectedType}
                onSelect={onSelectType}
            />

            {hasCards ? (
                <Pressable
                    onPress={onToggleSelect}
                    className={`mt-7 rounded-2xl border px-4 pb-4 pt-5 ${
                        selected
                            ? 'border-erum-main bg-[#f9f9f9]'
                            : 'border-[#C8F3E3] bg-[#f9f9f9]'
                    }`}
                >
                    {selectionDescription && (
                        <View className="flex-row items-center justify-center">
                            <View
                                className={`h-6 w-6 items-center justify-center rounded-full border ${
                                    selected
                                        ? 'border-erum-main bg-erum-main'
                                        : 'border-neutral-grey1 bg-white'
                                }`}
                            >
                                {selected && (
                                    <Feather name="check" size={16} color="#FFFFFF" />
                                )}
                            </View>

                            <Text className="ml-2 text-normal-bold text-erum-secondary">
                                {selectionDescription}
                            </Text>
                        </View>
                    )}

                    <View className={selectionDescription ? 'mt-5' : undefined}>
                        {selectedCombination.cards.map((card, index) => (
                            <View
                                key={`${selectedCombination.type}-${card.id}`}
                                className={
                                    index < selectedCombination.cards.length - 1
                                        ? 'mb-6'
                                        : undefined
                                }
                            >
                                <PaymentCardPreview card={card} />
                            </View>
                        ))}
                    </View>
                </Pressable>
            ) : (
                <View className="mt-7">
                    <NoticeBox description="추천하는 카드가 없습니다." />
                </View>
            )}
        </View>
    );
}
