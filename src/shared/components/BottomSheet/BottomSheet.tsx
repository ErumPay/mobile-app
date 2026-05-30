import type { ReactNode } from 'react';
import { memo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

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
          animationType="fade"
          transparent
          visible={visible}
          onRequestClose={onClose}
      >
        <View className="flex-1">
          <Pressable
              style={StyleSheet.absoluteFillObject}
              onPress={onClose}
          >
            <View className="flex-1 bg-neutral-black3" />
          </Pressable>

          <View className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-neutral-white px-5 pb-8 pt-4">
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