/******************************************************************************
 * File: Checkbox.tsx
 * Description: 단일 또는 다중 선택에 사용하는 공통 체크박스 컴포넌트
 * Worker: [FE] 조보름
 * Created: 2026-05-29
 * Note: 약관 동의, 옵션 선택 등 체크 상태 UI를 통일하기 위해 생성했습니다.
 ******************************************************************************/

import { Pressable, Text, View } from 'react-native';

type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function Checkbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      className="flex-row items-center gap-3"
      onPress={() => onChange(!checked)}
    >
      <View
        className={`h-6 w-6 items-center justify-center rounded-md border ${
          checked ? 'border-erum-main bg-erum-main' : 'border-neutral-grey1 bg-neutral-white'
        }`}
      >
        {checked ? (
          <Text className="font-pretendard text-normal-bold text-neutral-white">
            ✓
          </Text>
        ) : null}
      </View>
      <Text className="font-pretendard text-large-bold text-neutral-black1">
        {label}
      </Text>
    </Pressable>
  );
}

export default Checkbox;
