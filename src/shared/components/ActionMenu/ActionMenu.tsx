/******************************************************************************
 * File: ActionMenu.tsx
 * Description: 더보기 메뉴에서 사용하는 공통 액션 메뉴 컴포넌트
 * Worker: [FE] 조보름
 * Created: 2026-06-05
 * Note: 즐겨찾기, 삭제, 내보내기처럼 row 액션을 묶어 표시합니다.
 ******************************************************************************/

import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';

import { colors } from '../../styles/designTokens';

export type ActionMenuItem = {
  key: string;
  label: string;
  tone?: 'default' | 'danger';
  iconName?: ComponentProps<typeof Feather>['name'];
  onPress: () => void;
};

type ActionMenuProps = {
  visible: boolean;
  items: ActionMenuItem[];
  className?: string;
};

const textClassNameByTone: Record<NonNullable<ActionMenuItem['tone']>, string> = {
  default: 'text-neutral-black1',
  danger: 'text-state-error',
};

export function ActionMenu({
  visible,
  items,
  className = '',
}: ActionMenuProps) {
  if (!visible) {
    return null;
  }

  return (
    <View className={`rounded-lg bg-neutral-white px-5 py-4 shadow-lg ${className}`}>
      <View className="gap-3">
        {items.map((item) => {
          const tone = item.tone ?? 'default';

          return (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              className="flex-row items-center"
              onPress={item.onPress}
            >
              {item.iconName ? (
                <Feather
                  name={item.iconName}
                  size={16}
                  color={tone === 'danger' ? colors.state.error : colors.neutral.black1}
                />
              ) : null}
              <Text
                className={`font-pretendard text-normal-bold ${item.iconName ? 'ml-2' : ''} ${textClassNameByTone[tone]}`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default ActionMenu;
