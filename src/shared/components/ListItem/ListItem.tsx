/******************************************************************************
 * File: ListItem.tsx
 * Description: 목록 내 단일 행을 구성하는 공통 리스트 아이템 컴포넌트
 * Worker: [FE] 조보름
 * Created: 2026-05-29
 * Note: 제목/설명/우측 정보/선택 액션이 있는 리스트 UI에 사용합니다.
 ******************************************************************************/

import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

type ListItemProps = {
  title: string;
  description?: string;
  left?: ReactNode;
  right?: ReactNode;
  onPress?: () => void;
};

export function ListItem({
  title,
  description,
  left,
  right,
  onPress,
}: ListItemProps) {
  const content = (
    <View className="min-h-[56px] flex-row items-center gap-3">
      {left}
      <View className="min-w-0 flex-1">
        <Text className="font-pretendard text-large-bold text-neutral-black1">
          {title}
        </Text>
        {description ? (
          <Text className="mt-1 font-pretendard text-normal-regular text-neutral-black2">
            {description}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        className="rounded-lg bg-neutral-white px-4 py-3"
        style={({ pressed }) => ({
          opacity: pressed ? 0.72 : 1,
        })}
        onPress={onPress}
      >
        {content}
      </Pressable>
    );
  }

  return <View className="rounded-lg bg-neutral-white px-4 py-3">{content}</View>;
}

export default ListItem;
