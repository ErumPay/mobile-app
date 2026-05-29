/******************************************************************************
 * File: Header.tsx
 * Description: 뒤로가기형/닫기형 화면 상단 공통 헤더 컴포넌트
 * Worker: [FE] 조보름
 * Created: 2026-05-29
 * Note: 모바일 화면의 상단 네비게이션 영역을 통일하기 위해 생성했습니다.
 ******************************************************************************/

import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

type HeaderProps = {
  title: string;
  type?: 'back' | 'close';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onPressLeft?: () => void;
  onPressRight?: () => void;
};

export function Header({
  title,
  type = 'back',
  leftIcon,
  rightIcon,
  onPressLeft,
  onPressRight,
}: HeaderProps) {
  const isCloseType = type === 'close';
  const defaultLeftIcon = (
    <Text className="font-pretendard text-heading-3 text-neutral-black1">‹</Text>
  );
  const defaultRightIcon = (
    <Text className="font-pretendard text-heading-3 text-neutral-black1">×</Text>
  );

  return (
    <View className="min-h-[52px] w-full flex-row items-center justify-between bg-neutral-white px-5">
      <Pressable
        accessibilityRole={!isCloseType && onPressLeft ? 'button' : undefined}
        className="h-10 w-10 items-center justify-center"
        disabled={isCloseType || !onPressLeft}
        onPress={isCloseType ? undefined : onPressLeft}
      >
        {isCloseType ? null : leftIcon ?? defaultLeftIcon}
      </Pressable>

      <Text
        numberOfLines={1}
        className="min-w-0 flex-1 text-center font-pretendard text-heading-3 text-neutral-black1"
      >
        {title}
      </Text>

      <Pressable
        accessibilityRole={isCloseType || onPressRight ? 'button' : undefined}
        className="h-10 w-10 items-center justify-center"
        disabled={!onPressRight}
        onPress={onPressRight}
      >
        {isCloseType ? rightIcon ?? defaultRightIcon : rightIcon}
      </Pressable>
    </View>
  );
}

export default Header;
