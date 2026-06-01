import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import PaymentCardPreview from './PaymentCardPreview';
import type { PaymentCard } from '../types/paymentCard.types';

type Props = {
    card: PaymentCard;
    selected: boolean;
    onPress: () => void;
};

export default function RegisteredCardListItem({
                                                   card,
                                                   selected,
                                                   onPress,
                                               }: Props) {
    return (
        <Pressable
            onPress={onPress}
            className={`mb-3 min-h-[80px] flex-row items-center rounded-2xl border bg-neutral-white px-4 py-3 ${
                selected ? 'border-erum-main' : 'border-neutral-grey1'
            }`}
        >
            <PaymentCardPreview card={card} size="small" />

            <View className="ml-4 flex-1">
                <View className="flex-row items-center">
                    <Text className="text-large-bold text-neutral-black1">
                        {card.cardName}
                    </Text>

                    {card.isPrimary && (
                        <View className="ml-2 rounded bg-[#7ACB9A] px-2 py-0.5">
                            <Text className="text-small-bold text-neutral-white">대표</Text>
                        </View>
                    )}
                </View>

                <Text className="mt-2 text-small-regular text-neutral-grey4">
                    {card.maskedNumber}
                </Text>
            </View>

            {selected ? (
                <View className="h-8 w-8 items-center justify-center rounded-full bg-erum-main">
                    <Feather name="check" size={20} color="#FFFFFF" />
                </View>
            ) : (
                <Feather name="chevron-right" size={24} color="#A8B0B8" />
            )}
        </Pressable>
    );
}