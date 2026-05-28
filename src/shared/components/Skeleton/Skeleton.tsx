/******************************************************************************
 * File: Skeleton.tsx
 * Description: 데이터 로딩 전 화면 윤곽을 표시하는 공통 스켈레톤 컴포넌트
 * Worker: [FE] 조보름
 * Created: 2026-05-29
 * Note: 리스트/카드/텍스트 영역의 로딩 placeholder로 사용합니다.
 ******************************************************************************/

import { useEffect, useRef } from 'react';
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

export function Skeleton({
  width = '100%',
  height = 16,
  rounded = 'md',
}: SkeletonProps) {
  const shimmerTranslateX = useRef(new Animated.Value(-120)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerTranslateX, {
        toValue: 320,
        duration: 1300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [shimmerTranslateX]);

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
          style={
            {
              animationDuration: '1200ms',
              animationIterationCount: 'infinite',
              animationName: 'erumSkeletonShimmer',
              animationTimingFunction: 'ease-in-out',
              backgroundImage:
                'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.9), rgba(255,255,255,0))',
              bottom: 0,
              left: 0,
              position: 'absolute',
              top: 0,
              width: '46%',
            } as never
          }
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
          height: '100%',
          opacity: 0.75,
          transform: [{ translateX: shimmerTranslateX }],
          width: 96,
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
