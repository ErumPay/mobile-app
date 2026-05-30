import type { ReactNode } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { Button } from '../Button';

/**
 * 2버튼 모달
 *
 * 삭제/로그아웃/대표카드 설정처럼 실행 버튼과 닫기 버튼이 필요한 경우 사용합니다.
 *
 * 사용 예시:
 *
 * <TwoButtonModal
 *   visible={visible}
 *   icon={<Text className="text-[52px]">⭐</Text>}
 *   title="Nany My 카드를 대표카드로 지정 하시겠습니까?"
 *   description="결제 시 우선으로 사용됩니다"
 *   confirmLabel="대표카드 설정하기"
 *   cancelLabel="닫기"
 *   onConfirm={handleConfirm}
 *   onCancel={() => setVisible(false)}
 * />
 */
type TwoButtonModalProps = {
  visible: boolean;
  icon?: ReactNode;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function TwoButtonModal({
  visible,
  icon,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: TwoButtonModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onCancel}
    >
      <View className="flex-1 items-center justify-center bg-neutral-black3 px-9">
        <Pressable className="absolute inset-0" onPress={onCancel} />

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

          <View className="mt-7 w-full gap-3">
            <Button label={confirmLabel} size="large" onPress={onConfirm} />
            <Button
              label={cancelLabel}
              variant="secondary"
              size="large"
              onPress={onCancel}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default TwoButtonModal;