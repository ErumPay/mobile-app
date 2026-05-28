/******************************************************************************
 * File: Toggle.tsx
 * Description: 켜짐/꺼짐 상태를 전환하는 공통 토글 컴포넌트
 * Worker: [FE] 조보름
 * Created: 2026-05-29
 * Note: 설정성 옵션과 동의 상태 UI를 통일하기 위해 생성했습니다.
 ******************************************************************************/

import { Pressable, Text, View } from 'react-native';

type ToggleProps = {
  label?: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

export function Toggle({ label, value, onChange }: ToggleProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      className="flex-row items-center justify-between gap-4"
      onPress={() => onChange(!value)}
    >
      {label ? (
        <Text className="min-w-0 flex-1 font-pretendard text-large-bold text-neutral-black1">
          {label}
        </Text>
      ) : null}
      <View
        className={`h-8 w-14 justify-center rounded-full px-1 ${
          value ? 'items-end bg-erum-main' : 'items-start bg-neutral-grey1'
        }`}
      >
        <View className="h-6 w-6 rounded-full bg-neutral-white" />
      </View>
    </Pressable>
  );
}

export default Toggle;
