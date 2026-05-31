import type { ReactNode } from 'react';
import { memo, useEffect, useMemo, useRef } from 'react';
import {
    Animated,
    PanResponder,
    Pressable,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';

import { colors } from '../../styles';

type DraggableBottomSheetProps = {
    visible: boolean;
    title?: string;
    children: ReactNode;
    initialRatio?: number;
    expandedRatio?: number;
    onClose: () => void;
};

function DraggableBottomSheetComponent({
                                           visible,
                                           title,
                                           children,
                                           initialRatio = 0.38,
                                           expandedRatio = 0.83,
                                           onClose,
                                       }: DraggableBottomSheetProps) {
    const { height } = useWindowDimensions();
    const minHeight = height * initialRatio;
    const maxHeight = height * expandedRatio;
    const dragStartHeight = useRef(minHeight);
    const currentHeight = useRef(minHeight);
    const animatedHeight = useRef(new Animated.Value(minHeight)).current;

    useEffect(() => {
        if (!visible) {
            return;
        }

        currentHeight.current = minHeight;
        animatedHeight.setValue(minHeight);
    }, [animatedHeight, minHeight, visible]);

    const animateToHeight = (nextHeight: number) => {
        currentHeight.current = Math.round(nextHeight);

        Animated.spring(animatedHeight, {
            toValue: nextHeight,
            friction: 9,
            tension: 80,
            useNativeDriver: false,
        }).start();
    };

    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onStartShouldSetPanResponder: () => true,
                onMoveShouldSetPanResponder: (_, gestureState) =>
                    Math.abs(gestureState.dy) > 6,
                onPanResponderGrant: () => {
                    dragStartHeight.current = currentHeight.current;
                },
                onPanResponderMove: (_, gestureState) => {
                    const nextHeight = Math.min(
                        maxHeight,
                        Math.max(minHeight, dragStartHeight.current - gestureState.dy),
                    );

                    currentHeight.current = nextHeight;
                    animatedHeight.setValue(nextHeight);
                },
                onPanResponderRelease: (_, gestureState) => {
                    const midpoint = (minHeight + maxHeight) / 2;
                    const releasedHeight = currentHeight.current;

                    const nextHeight =
                        gestureState.dy < -24
                            ? maxHeight
                            : gestureState.dy > 24
                                ? minHeight
                                : releasedHeight >= midpoint
                                    ? maxHeight
                                    : minHeight;

                    animateToHeight(nextHeight);
                },
            }),
        [animatedHeight, maxHeight, minHeight],
    );
    if (!visible) {
        return null;
    }

    return (
        <View style={StyleSheet.absoluteFillObject} className="z-50">
            <Pressable
                style={StyleSheet.absoluteFillObject}
                onPress={onClose}
            >
                <View className="flex-1 bg-neutral-black3" />
            </Pressable>

            <Animated.View
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: colors.neutral.white,
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    height: animatedHeight,
                    overflow: 'hidden',
                    paddingBottom: 32,
                    paddingHorizontal: 20,
                    paddingTop: 0,
                }}
            >
                <View className="items-center pb-4" {...panResponder.panHandlers}>
                    <View className="h-8 w-24 items-center justify-center">
                        <View className="h-1 w-10 rounded-full bg-neutral-grey1" />
                    </View>
                </View>

                {title ? (
                    <View className="mb-4 flex-row items-center justify-between">
                        <Text className="font-pretendard text-heading-3 text-neutral-black1">
                            {title}
                        </Text>

                        <Pressable
                            accessibilityRole="button"
                            className="h-8 w-8 items-center justify-center"
                            onPress={onClose}
                        >
                            <Text className="font-pretendard text-heading-3 text-neutral-black2">
                                ×
                            </Text>
                        </Pressable>
                    </View>
                ) : null}

                <View className="flex-1">{children}</View>
            </Animated.View>
        </View>
    );
}

export const DraggableBottomSheet = memo(DraggableBottomSheetComponent);

export default DraggableBottomSheet;