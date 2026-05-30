import { Pressable, Text, View } from 'react-native';

import PaymentCardPreview from './PaymentCardPreview';
import type { RecommendedPaymentCard } from '../types/paymentCard.types';

type Props = {
    recommendedCard: RecommendedPaymentCard;
    selected: boolean;
    onPress: () => void;
};

export default function RecommendedCardSection({
                                                   recommendedCard,
                                                   selected,
                                                   onPress,
                                               }: Props) {
    return (
        <View>
            <View className="flex-row items-center">
                <Text className="text-heading-3 text-neutral-black1">
                    {recommendedCard.title}
                </Text>

                {recommendedCard.badgeText && (
                    <View className="ml-2 rounded-full bg-erum-main px-2 py-0.5">
                        <Text className="text-small-bold text-neutral-white">
                            {recommendedCard.badgeText}
                        </Text>
                    </View>
                )}
            </View>

            {recommendedCard.description && (
                <Text className="mt-2 text-small-regular text-neutral-black2">
                    {recommendedCard.description}
                </Text>
            )}

            <Pressable
                onPress={onPress}
                className={`mt-5 rounded-2xl border bg-[#EBFFF8] p-4 ${
                    selected ? 'border-erum-main' : 'border-[#BDF5DF]'
                }`}
            >
                <PaymentCardPreview card={recommendedCard.card} selected={selected} />

                {recommendedCard.card.benefitDescription && (
                    <Text className="mt-3 text-small-regular text-neutral-grey4">
                        · {recommendedCard.card.benefitDescription}
                    </Text>
                )}
            </Pressable>
        </View>
    );
}