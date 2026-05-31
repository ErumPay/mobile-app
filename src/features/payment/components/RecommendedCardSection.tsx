import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import PaymentCardPreview from './PaymentCardPreview';
import type { RecommendedPaymentCard } from '../types/paymentCard.types';

type Props = {
    recommendedCard: RecommendedPaymentCard;
    selected: boolean;
    showBenefitDescription?: boolean;
    actionLabel?: string;
    onPress: () => void;
    onPressAction?: () => void;
};

export default function RecommendedCardSection({
                                                   recommendedCard,
                                                   selected,
                                                   showBenefitDescription = true,
                                                   actionLabel,
                                                   onPress,
                                                   onPressAction,
                                               }: Props) {
    return (
        <View>
            <View className="flex-row items-center justify-between gap-3">
                <View className="min-w-0 flex-1 flex-row items-center">
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

                {actionLabel && onPressAction && (
                    <Pressable
                        onPress={onPressAction}
                        className="flex-row items-center rounded-lg border border-neutral-grey1 px-3 py-2"
                    >
                        <Feather name="list" size={14} color="#1D1F1F" />
                        <Text className="ml-1 text-small-bold text-neutral-black1">
                            {actionLabel}
                        </Text>
                    </Pressable>
                )}
            </View>


            <Pressable
                onPress={onPress}
                className={`mt-5 rounded-2xl border bg-[#EBFFF8] p-4 ${
                    selected ? 'border-erum-main' : 'border-[#BDF5DF]'
                }`}
            >
                <PaymentCardPreview card={recommendedCard.card} selected={selected} />

                {showBenefitDescription && recommendedCard.card.benefitDescription && (
                    <Text className="mt-3 text-small-regular text-neutral-grey4">
                        · {recommendedCard.card.benefitDescription}
                    </Text>
                )}
            </Pressable>
        </View>
    );
}