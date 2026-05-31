import { View } from 'react-native';

import { Tab } from '../../../shared/components/Tab';
import type {
    CardCombination,
    CardCombinationType,
} from '../types/paymentCard.types';

type Props = {
    combinations: CardCombination[];
    selectedType: CardCombinationType;
    onSelect: (type: CardCombinationType) => void;
};

export default function CardCombinationTabs({
                                                combinations,
                                                selectedType,
                                                onSelect,
                                            }: Props) {
    return (
        <View className="mt-4">
            <Tab
                items={combinations.map((combination) => ({
                    label: combination.label,
                    value: combination.type,
                }))}
                value={selectedType}
                onChange={(value) => onSelect(value as CardCombinationType)}
            />
        </View>
    );
}