/******************************************************************************
 * File: Header.tsx
 * Description: 뒤로가기형/닫기형 화면 상단 공통 헤더 컴포넌트
 * Worker: [FE] 조보름
 * Created: 2026-05-29
 * Note: 모바일 화면의 상단 네비게이션 영역을 통일하기 위해 생성했습니다.
 ******************************************************************************/

import type { ReactNode } from 'react';
import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

type HeaderProps = {
    title: string;
    type?: 'back' | 'close';
    tone?: 'light' | 'dark';
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    onPressLeft?: () => void;
    onPressRight?: () => void;
};
export function Header({
   title,
   type = 'back',
   tone = 'light',
   leftIcon,
   rightIcon,
   onPressLeft,
   onPressRight,
}: HeaderProps) {
    const isDark = tone === 'dark';
    const iconColor = isDark ? '#FFFFFF' : '#1D1F1F';
    const containerClassName = isDark ? 'bg-black' : 'bg-neutral-white';
    const textClassName = isDark ? 'text-neutral-white' : 'text-neutral-black1';

  const isCloseType = type === 'close';
  const iconClassName = `font-pretendard text-heading-2 ${textClassName}`;
  const defaultLeftIcon = (
    <Feather name="chevron-left" size={28} color={iconColor} />
  );
  const defaultRightIcon = (
      <Feather name="x" size={28} color={iconColor} />
  );

  return (
    <View className={`w-full flex-row items-center justify-between py-3 px-5 ${containerClassName}`}>
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
        className={`min-w-0 flex-1 text-center font-pretendard text-heading-2 ${textClassName}`}
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
