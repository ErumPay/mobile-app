/******************************************************************************
 * File: Card.tsx
 * Description: 콘텐츠를 묶어 보여주는 공통 카드 컨테이너 컴포넌트
 * Worker: [FE] 조보름
 * Created: 2026-05-29
 * Note: 결제수단, 안내, 요약 정보 등 카드형 UI의 기본 형태를 제공합니다.
 ******************************************************************************/

import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

type CardProps = {
  title?: string;
  description?: string;
  children?: ReactNode;
  selected?: boolean;
  onPress?: () => void;
};

export function Card({
  title,
  description,
  children,
  selected = false,
  onPress,
}: CardProps) {
  const content = (
    <>
      {title ? (
        <Text className="font-pretendard text-large-bold text-neutral-black1">
          {title}
        </Text>
      ) : null}
      {description ? (
        <Text className="mt-1 font-pretendard text-large-regular text-neutral-black2">
          {description}
        </Text>
      ) : null}
      {children ? (
        <View className={title || description ? 'mt-3' : ''}>{children}</View>
      ) : null}
    </>
  );

  const className = `rounded-xl border bg-neutral-white p-4 ${
    selected ? 'border-erum-main bg-neutral-grey2' : 'border-neutral-grey1'
  }`;

  if (onPress) {
    return (
      <Pressable accessibilityRole="button" className={className} onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return <View className={className}>{content}</View>;
}

export default Card;
