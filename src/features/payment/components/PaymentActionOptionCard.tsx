import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import type { PaymentActionOption } from '../types/paymentMethod.types';

type Props = {
    option: PaymentActionOption;
    onPress: (type: PaymentActionOption['type']) => void;
};

export default function PaymentActionOptionCard({ option, onPress }: Props) {
    const isReject = option.type === 'REJECT';

    const iconName =
        option.type === 'REJECT'
            ? 'x-circle'
            : option.type === 'REMOTE_REQUEST'
                ? 'send'
                : option.type === 'DUTCH_PAY'
                    ? 'users'
                    : 'credit-card';

    const iconColor = isReject ? '#EF5350' : '#2FAB84';

    return (
        <Pressable
            accessibilityRole="button"
            className="w-full flex-row items-center rounded-xl border border-neutral-grey1 bg-neutral-white px-6 py-6"
            onPress={() => onPress(option.type)}
        >
            <View className="mr-5 h-14 w-14 items-center justify-center rounded-2xl bg-neutral-grey2">
                <Feather name={iconName} size={28} color={iconColor} />
            </View>

            <View className="min-w-0 flex-1">
                <Text className="font-pretendard text-heading-3 text-neutral-black1">
                    {option.title}
                </Text>
                <Text className="mt-2 font-pretendard text-normal-regular text-neutral-black2">
                    {option.description}
                </Text>
            </View>
        </Pressable>
    );
}