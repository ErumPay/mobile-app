/******************************************************************************
 * File: DraggableBottomSheet.tsx
 * Description: 사용자가 끌어올리고 내릴 수 있는 확장형 공통 바텀시트 컴포넌트
 * Worker: [FE] 조보름
 * Created: 2026-05-29
 * Note: 추가 패키지 없이 PanResponder로 기본 드래그 높이 변경을 제공합니다.
 ******************************************************************************/

import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
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

export function DraggableBottomSheet({
  visible,
  title,
  children,
  initialRatio = 0.38,
  expandedRatio = 0.72,
  onClose,
}: DraggableBottomSheetProps) {
  const { height } = useWindowDimensions();
  const minHeight = height * initialRatio;
  const maxHeight = height * expandedRatio;
  const [sheetHeight, setSheetHeight] = useState(minHeight);
  const dragStartHeight = useRef(minHeight);
  const currentHeight = useRef(minHeight);
  const animatedHeight = useRef(new Animated.Value(minHeight)).current;

  useEffect(() => {
    setSheetHeight(minHeight);
    currentHeight.current = minHeight;
    animatedHeight.setValue(minHeight);
  }, [animatedHeight, minHeight]);

  const animateToHeight = (nextHeight: number) => {
    currentHeight.current = Math.round(nextHeight);
    setSheetHeight(nextHeight);
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
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dy) > 6,
        onMoveShouldSetPanResponderCapture: (_, gestureState) =>
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
          const shouldExpand = gestureState.dy < -24;
          const shouldCollapse = gestureState.dy > 24;
          const nextHeight = shouldExpand
            ? maxHeight
            : shouldCollapse
              ? minHeight
              : releasedHeight >= midpoint
                ? maxHeight
                : minHeight;

          animateToHeight(nextHeight);
        },
      }),
    [animatedHeight, maxHeight, minHeight],
  );

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-neutral-black3">
        <Pressable className="flex-1" onPress={onClose} />

        <Animated.View
          style={{
            backgroundColor: colors.neutral.white,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            height: animatedHeight,
            overflow: 'hidden',
            paddingBottom: 32,
            paddingHorizontal: 20,
            paddingTop: 16,
          }}
          className="rounded-t-2xl bg-neutral-white shadow-sm"
        >
          <View
            className="items-center pb-4"
            {...panResponder.panHandlers}
          >
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

          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

export default DraggableBottomSheet;
