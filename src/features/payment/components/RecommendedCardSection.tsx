import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import NoticeBox from '../../../shared/components/NoticeBox';
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
            <Text className="mt-2 text-small-regular leading-5 text-neutral-grey4">
                할인 혜택뿐만 아니라 캐시백 및 마일리지 적립 혜택까지 함께 고려하여 제공합니다!
            </Text>


            {recommendedCard.card ? (
                <Pressable
                    onPress={onPress}
                    className={`mt-5 rounded-2xl border bg-[#EBFFF8] p-4 ${
                        selected ? 'border-erum-main' : 'border-[#BDF5DF]'
                    }`}
                >
                    {showBenefitDescription && (
                        <View className="mb-5 flex-row items-center justify-center">
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

                            <Text className="ml-2 text-normal-bold text-neutral-black1">
                                추천 카드 선택하기
                            </Text>
                        </View>
                    )}

                    <PaymentCardPreview card={recommendedCard.card} selected={selected} />

                    {showBenefitDescription
                    // && (
                    //     <Text className="mt-3 text-small-regular leading-5 text-neutral-grey4">
                    //         {
                    //             '이룸페이 추천 카드는 할인 혜택뿐만 아니라 캐시백 및 마일리지 적립 혜택까지 함께 고려하여 제공합니다.'
                    //         }
                    //     </Text>
                    // )
                    }
                </Pressable>
            ) : (
                <View className="mt-5">
                    <NoticeBox description="추천하는 카드가 없습니다." />
                </View>
            )}
        </View>
    );
}
