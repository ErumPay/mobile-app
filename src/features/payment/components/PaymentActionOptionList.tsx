import { View } from 'react-native';

import type { PaymentActionOption } from '../types/paymentMethod.types';
import PaymentActionOptionCard from './PaymentActionOptionCard';

type Props = {
    options: PaymentActionOption[];
    onPressOption: (type: PaymentActionOption['type']) => void;
};

export default function PaymentActionOptionList({
                                                    options,
                                                    onPressOption,
                                                }: Props) {
    return (
        <View className="mt-12 gap-4 px-4">
            {options.map((option) => (
                <PaymentActionOptionCard
                    key={option.type}
                    option={option}
                    onPress={onPressOption}
                />
            ))}
        </View>
    );
}