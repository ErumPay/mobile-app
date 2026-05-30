import type { ReactNode } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { Button } from '../Button';

/**
 * 1버튼 모달
 *
 * 완료/안내 팝업처럼 확인 버튼 하나만 필요한 경우 사용합니다.
 *
 * 사용 예시:
 *
 * <OneButtonModal
 *   visible={visible}
 *   icon={<Text className="text-[52px]">✅</Text>}
 *   title="카드 삭제가 완료되었습니다."
 *   confirmLabel="확인"
 *   onConfirm={() => setVisible(false)}
 * />
 */
type OneButtonModalProps = {
  visible: boolean;
  icon?: ReactNode;
  title: string;
  description?: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose?: () => void;
};

export function OneButtonModal({
  visible,
  icon,
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
}: OneButtonModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-neutral-black3 px-9">
        {onClose ? (
          <Pressable className="absolute inset-0" onPress={onClose} />
        ) : null}

        <View className="w-full max-w-[320px] items-center rounded-3xl bg-neutral-white px-6 pb-6 pt-9">
          {icon ? <View className="mb-6">{icon}</View> : null}

          <Text className="text-center font-pretendard text-heading-3 text-neutral-black1">
            {title}
          </Text>

          {description ? (
            <Text className="mt-3 text-center font-pretendard text-large-regular text-neutral-black2">
              {description}
            </Text>
          ) : null}

          <View className="mt-7 w-full">
            <Button label={confirmLabel} size="large" onPress={onConfirm} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default OneButtonModal;