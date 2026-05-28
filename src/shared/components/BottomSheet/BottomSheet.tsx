/******************************************************************************
 * File: BottomSheet.tsx
 * Description: 화면 하단에서 노출되는 공통 바텀시트 컴포넌트
 * Worker: [FE] 조보름
 * Created: 2026-05-29
 * Note: 공통 피드백/선택 UI에서 재사용하기 위해 생성했습니다.
 ******************************************************************************/

import type { ReactNode } from 'react';
import { memo } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

type BottomSheetProps = {
  visible: boolean;
  title?: string;
  children: ReactNode;
  onClose: () => void;
};

function BottomSheetComponent({
  visible,
  title,
  children,
  onClose,
}: BottomSheetProps) {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-neutral-black3">
        <Pressable className="flex-1" onPress={onClose} />

        <View className="rounded-t-2xl bg-neutral-white px-5 pb-8 pt-4">
          <View className="mb-4 h-1 w-10 self-center rounded-full bg-neutral-grey1" />

          {title ? (
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="font-pretendard text-heading-3 text-neutral-black1">
                {title}
              </Text>
              <Pressable
                accessibilityRole="button"
                className="h-8 w-8 items-center justify-center"
                onPress={onClose}
              >
                <Text className="font-pretendard text-heading-3 text-neutral-black2">
                  ×
                </Text>
              </Pressable>
            </View>
          ) : null}

          {children}
        </View>
      </View>
    </Modal>
  );
}

export const BottomSheet = memo(BottomSheetComponent);

export default BottomSheet;
