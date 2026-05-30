import { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import type { PaymentCard } from '../types/paymentCard.types';

type Props = {
    card: PaymentCard;
    selected?: boolean;
    size?: 'large' | 'small';
};

export default function PaymentCardPreview({
                                               card,
                                               selected = false,
                                               size = 'large',
                                           }: Props) {
    const [isDetectedVertical, setIsDetectedVertical] = useState(false);

    useEffect(() => {
        Image.getSize(
            card.imageUrl,
            (width, height) => {
                setIsDetectedVertical(height > width);
            },
            () => {
                setIsDetectedVertical(card.imageOrientation === 'VERTICAL');
            },
        );
    }, [card.imageOrientation, card.imageUrl]);

    const isVertical = card.imageOrientation === 'VERTICAL' || isDetectedVertical;

    const containerClassName =
        size === 'small'
            ? 'h-14 w-20 rounded-lg'
            : 'h-[176px] w-full rounded-2xl';

    const imageStyle =
        size === 'small'
            ? {
                width: isVertical ? 56 : 80,
                height: isVertical ? 88 : 56,
                transform: isVertical ? [{ rotate: '90deg' as const }] : undefined,
            }
            : {
                width: isVertical ? 176 : 280,
                height: isVertical ? 280 : 176,
                transform: isVertical ? [{ rotate: '90deg' as const }] : undefined,
            };

    return (
        <View
            className={`relative items-center justify-center overflow-hidden ${containerClassName}`}
        >
            <Image source={{ uri: card.imageUrl }} resizeMode="cover" style={imageStyle} />

            {selected && size === 'large' && (
                <View className="absolute right-3 top-3 h-8 w-8 items-center justify-center rounded-full bg-erum-main">
                    <Feather name="check" size={22} color="#FFFFFF" />
                </View>
            )}
        </View>
    );
}