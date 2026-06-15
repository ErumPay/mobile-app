import { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import type { PaymentCard } from '../types/paymentCard.types';

type Props = {
    card: PaymentCard;
    selected?: boolean;
    size?: 'large' | 'grid' | 'small';
    showInfoOverlay?: boolean;
};

export default function PaymentCardPreview({
                                               card,
                                               selected = false,
                                               size = 'large',
                                               showInfoOverlay = true,
}: Props) {
    const hasImageUrl = card.imageUrl.length > 0;
    const [isVerticalImage, setIsVerticalImage] = useState(false);

    useEffect(() => {
        if (!hasImageUrl) {
            setIsVerticalImage(false);
            return;
        }

        Image.getSize(
            card.imageUrl,
            (width, height) => {
                setIsVerticalImage(height > width);
            },
            () => {
                setIsVerticalImage(false);
            },
        );
    }, [card.imageUrl, hasImageUrl]);

    const containerClassName =
        size === 'small'
            ? 'h-14 w-20 rounded-lg'
            : size === 'grid'
                ? 'h-[104px] w-full rounded-xl'
                : 'h-[176px] w-full rounded-2xl';
    const wrapperClassName =
        size === 'small'
            ? 'relative items-center'
            : 'relative w-full items-center';

    const imageStyle = isVerticalImage
        ? {
            width: size === 'small' ? 48 : size === 'grid' ? 104 : 176,
            height: size === 'small' ? 80 : size === 'grid' ? 176 : 300,
            opacity: showInfoOverlay ? 0.8 : 1,
            transform: [{ rotate: '90deg' }],
        }
        : {
            width: '100%' as const,
            height: '100%' as const,
            opacity: showInfoOverlay ? 0.8 : 1,
        };
    const companyTextClassName =
        size === 'small'
            ? 'text-center font-pretendard text-caption-bold text-neutral-black1'
            : size === 'grid'
                ? 'text-center font-pretendard text-[11px] leading-4 text-neutral-black1'
            : 'text-center font-pretendard text-normal-bold text-neutral-black1';
    const maskedNumberTextClassName =
        size === 'small'
            ? 'text-center font-pretendard text-[10px] leading-3 text-neutral-grey4'
            : 'text-center font-pretendard text-small-regular text-neutral-grey4';

    return (
        <View className={wrapperClassName}>
            <View
                className={`relative items-center justify-center overflow-hidden ${containerClassName}`}
            >
                {hasImageUrl ? (
                    <>
                        <Image
                            source={{ uri: card.imageUrl }}
                            resizeMode={isVerticalImage ? 'cover' : 'contain'}
                            style={imageStyle}
                        />
                        {showInfoOverlay && (
                            <View className="absolute inset-0 items-center justify-center px-2">
                                <View
                                    className={
                                        size === 'small'
                                            ? 'max-w-[72px] rounded-md bg-neutral-white/90 px-1.5 py-0.5'
                                            : size === 'grid'
                                                ? 'max-w-[88%] rounded-lg bg-neutral-white/90 px-2 py-1'
                                            : 'max-w-[88%] rounded-xl bg-neutral-white/90 px-4 py-2'
                                    }
                                >
                                    <Text
                                        className={companyTextClassName}
                                        numberOfLines={1}
                                    >
                                        {card.cardCompany}
                                    </Text>
                                    {size === 'large' && (
                                        <Text
                                            className={maskedNumberTextClassName}
                                            numberOfLines={1}
                                        >
                                            {card.maskedNumber}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        )}
                    </>
                ) : (
                    <View className="h-full w-full items-center justify-center rounded-2xl bg-erum-main px-4">
                        <Text className="text-center font-pretendard text-large-bold text-neutral-white">
                            {card.cardCompany}
                        </Text>
                        <Text className="mt-2 text-center font-pretendard text-normal-regular text-neutral-white">
                            {card.maskedNumber}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}
