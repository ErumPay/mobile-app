import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import PaymentCardPreview from './PaymentCardPreview';
import CardCombinationTabs from './CardCombinationTabs';
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
                <>
                    <Pressable
                        onPress={onToggleSelect}
                        className="mt-7 flex-row items-center justify-center"
                    >
                        <View
                            className={`h-6 w-6 items-center justify-center rounded-full border ${
                                selected ? 'border-erum-main bg-erum-main' : 'border-neutral-grey1 bg-white'
                            }`}
                        >
                            {selected && <Feather name="check" size={16} color="#FFFFFF" />}
                        </View>

                        <Text className="ml-2 text-normal-bold text-neutral-black1">
                            이 조합 선택하기
                        </Text>
                    </Pressable>

                    <View className="mt-7">
                        {selectedCombination.cards.map((card) => (
                            <View key={`${selectedCombination.type}-${card.id}`} className="mb-6">
                                <PaymentCardPreview card={card} />

                                {selectedCombination.benefitDescription && (
                                    <Text className="mt-2 text-small-regular text-neutral-grey4">
                                        · {selectedCombination.benefitDescription}
                                    </Text>
                                )}
                            </View>
                        ))}
                    </View>
                </>
            ) : (
                <View className="mt-7 rounded-xl bg-neutral-grey0 px-4 py-6">
                    <Text className="text-center text-normal-regular text-neutral-black2">
                        추천되는 카드 조합이 없습니다.
                    </Text>
                </View>
            )}
        </View>
    );
}