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
            <View className="shrink-0">
                <PaymentCardPreview card={card} size="small" showInfoOverlay={false} />
            </View>

            <View className="ml-4 min-w-0 flex-1">
                <Text className="mb-1 text-small-bold text-neutral-grey4" numberOfLines={1}>
                    {card.cardCompany}
                </Text>

                <View className="min-w-0 flex-row items-center">
                    <Text
                        className="min-w-0 flex-1 text-large-bold text-neutral-black1"
                        numberOfLines={2}
                        ellipsizeMode="tail"
                    >
                        {card.cardName}
                    </Text>

                    {card.isPrimary && (
                        <View className="ml-2 shrink-0 rounded bg-[#7ACB9A] px-2 py-0.5">
                            <Text className="text-small-bold text-neutral-white">대표</Text>
                        </View>
                    )}
                </View>

                <Text className="mt-2 text-small-regular text-neutral-grey4" numberOfLines={1}>
                    {card.maskedNumber}
                </Text>
            </View>

            {selected ? (
                <View className="ml-3 h-8 w-8 shrink-0 items-center justify-center rounded-full bg-erum-main">
                    <Feather name="check" size={20} color="#FFFFFF" />
                </View>
            ) : (
                <View className="ml-3 shrink-0">
                    <Feather name="chevron-right" size={24} color="#A8B0B8" />
                </View>
            )}
        </Pressable>
    );
}
