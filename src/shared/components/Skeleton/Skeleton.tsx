/******************************************************************************
 * File: Skeleton.tsx
 * Description: 데이터 로딩 전 화면 윤곽을 표시하는 공통 스켈레톤 컴포넌트
 * Worker: [FE] 조보름
 * Created: 2026-05-29
 * Note: 리스트/카드/텍스트 영역의 로딩 placeholder로 사용합니다.
 ******************************************************************************/

import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import type { ViewStyle } from 'react-native';
import { Animated, Easing, Platform, View } from 'react-native';

import { colors } from '../../styles';

type SkeletonProps = {
  width?: number | `${number}%`;
  height?: number;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
};

const roundedClassName = {
  sm: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

const borderRadiusByRounded = {
  sm: 4,
  md: 6,
  lg: 8,
  full: 999,
};

const webShimmerStyle: CSSProperties = {
  animationDuration: '1200ms',
  animationIterationCount: 'infinite',
  animationName: 'erumSkeletonShimmer',
  animationTimingFunction: 'ease-in-out',
  backgroundImage:
    'linear-gradient(105deg, rgba(255,255,255,0), rgba(255,255,255,0.82), rgba(255,255,255,0))',
  height: '180%',
  left: 0,
  position: 'absolute',
  top: '-40%',
  width: '42%',
};

export function Skeleton({
  width = '100%',
  height = 16,
  rounded = 'md',
}: SkeletonProps) {
  const shimmerProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerProgress, {
        toValue: 1,
        duration: 1300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, []);

  const shimmerTranslateX = shimmerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 320],
  });

  if (Platform.OS === 'web') {
    return (
      <View
        style={{
          backgroundColor: colors.neutral.grey1,
          borderRadius: borderRadiusByRounded[rounded],
          height,
          overflow: 'hidden',
          position: 'relative',
          width,
        }}
      >
        <View
          style={webShimmerStyle as ViewStyle}
        />
      </View>
    );
  }

  return (
    <View
      style={{ width, height }}
      className={`overflow-hidden bg-neutral-grey1 ${roundedClassName[rounded]}`}
    >
      <Animated.View
        style={{
          backgroundColor: colors.neutral.white,
          height: '180%',
          opacity: 0.68,
          position: 'absolute',
          top: '-40%',
          transform: [
            { translateX: shimmerTranslateX },
            { rotate: '12deg' },
          ],
          width: 64,
        }}
      />
    </View>
  );
}

export function SkeletonCard() {
  return (
    <View className="gap-3 rounded-xl border border-neutral-grey1 bg-neutral-white p-4">
      <Skeleton width="34%" height={12} />
      <Skeleton width="48%" height={16} />
      <Skeleton height={86} rounded="lg" />
      <Skeleton width="72%" height={14} />
      <Skeleton width="36%" height={14} />
    </View>
  );
}

export default Skeleton;
