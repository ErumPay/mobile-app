import { Feather } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { memo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { colors } from '../../styles';

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
  const { height } = useWindowDimensions();
  const maxHeight = height * 0.8;

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

          <View
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-neutral-white px-5 pb-8 pt-4"
            style={{ maxHeight }}
          >
            {title ? (
                <View className="mb-5 flex-row items-center justify-between">
                  <Text className="font-pretendard text-heading-2 text-neutral-black1">
                    {title}
                  </Text>

                  <Pressable
                      accessibilityRole="button"
                      className="h-11 w-11 items-center justify-center"
                      onPress={onClose}
                  >
                    <Feather name="x" size={28} color={colors.neutral.black1} />
                  </Pressable>
                </View>
            ) : null}

            <ScrollView
              bounces={false}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          </View>
        </View>
      </Modal>
  );
}

export const BottomSheet = memo(BottomSheetComponent);

export default BottomSheet;
