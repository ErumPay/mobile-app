/******************************************************************************
 * File: Radio.tsx
 * Description: 여러 항목 중 하나를 선택하는 공통 라디오 컴포넌트
 * Worker: [FE] 조보름
 * Created: 2026-05-29
 * Note: 결제수단, 필터, 단일 옵션 선택 UI를 통일하기 위해 생성했습니다.
 ******************************************************************************/

import { Pressable, Text, View } from 'react-native';

export type RadioItem = {
  label: string;
  value: string;
};

type RadioProps = {
  items: RadioItem[];
  value: string;
  onChange: (value: string) => void;
};

export function Radio({ items, value, onChange }: RadioProps) {
  return (
    <View className="gap-3">
      {items.map((item) => {
        const checked = item.value === value;

        return (
          <Pressable
            key={item.value}
            accessibilityRole="radio"
            accessibilityState={{ checked }}
            className="flex-row items-center gap-3"
            onPress={() => onChange(item.value)}
          >
            <View
              className={`h-6 w-6 items-center justify-center rounded-full border ${
                checked ? 'border-erum-main' : 'border-neutral-grey1'
              }`}
            >
              {checked ? <View className="h-3 w-3 rounded-full bg-erum-main" /> : null}
            </View>
            <Text className="font-pretendard text-large-bold text-neutral-black1">
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default Radio;
