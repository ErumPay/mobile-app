/******************************************************************************
 * File: Tab.tsx
 * Description: 여러 보기/상태를 전환하는 공통 탭 컴포넌트
 * Worker: [FE] 조보름
 * Created: 2026-05-29
 * Note: 화면 내 섹션 전환 UI를 디자인 토큰 기준으로 통일하기 위해 생성했습니다.
 ******************************************************************************/

import { Pressable, Text, View } from 'react-native';

export type TabItem = {
  label: string;
  value: string;
};

type TabProps = {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
};

export function Tab({ items, value, onChange }: TabProps) {
  return (
    <View className="w-full flex-row rounded-lg bg-neutral-grey1 p-1">
      {items.map((item) => {
        const isSelected = item.value === value;

        return (
          <Pressable
            key={item.value}
            accessibilityRole="button"
            className={`min-h-[40px] min-w-0 flex-1 items-center justify-center rounded-md px-3 ${
              isSelected ? 'bg-neutral-white' : 'bg-transparent'
            }`}
            onPress={() => onChange(item.value)}
          >
            <Text
              numberOfLines={1}
              className={`font-pretendard text-large-bold ${
                isSelected ? 'text-erum-main' : 'text-neutral-black2'
              }`}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default Tab;
