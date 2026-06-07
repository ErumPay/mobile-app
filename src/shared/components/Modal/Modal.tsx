import type { ReactNode } from 'react';
import type { TextStyle } from 'react-native';
import { Modal as RNModal, Pressable, Text, View } from 'react-native';

import { Button } from '../Button';

type ModalType = 'one' | 'two';

type CommonModalProps = {
  visible: boolean;
  type: ModalType;
  icon?: ReactNode;
  title: string;
  description?: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
};

type OneButtonModalProps = CommonModalProps & {
  type: 'one';
  cancelLabel?: never;
  onCancel?: never;
};

type TwoButtonModalProps = CommonModalProps & {
  type: 'two';
  cancelLabel: string;
  onCancel: () => void;
};

type ModalProps = OneButtonModalProps | TwoButtonModalProps;

const WORD_JOINER = '\u2060';

function keepAllText(text: string) {
  return text
    .split(/(\s+)/)
    .map((chunk) => (/\s+/.test(chunk) ? chunk : Array.from(chunk).join(WORD_JOINER)))
    .join('');
}

/**
 * 공통 Modal 컴포넌트
 *
 * type="one": 확인 버튼 1개짜리 안내/완료 모달
 *
 * <Modal
 *   visible={visible}
 *   type="one"
 *   icon={<Text className="text-[52px]">✅</Text>}
 *   title="카드 삭제가 완료되었습니다."
 *   confirmLabel="확인"
 *   onConfirm={() => setVisible(false)}
 *   onClose={() => setIsOneButtonModalVisible(false)}
 * 
 * />
 *
 * type="two": 실행 버튼 + 취소 버튼 2개짜리 확인 모달
 *
 * <Modal
 *   visible={visible}
 *   type="two"
 *   icon={<Text className="text-[52px]">⭐</Text>}
 *   title="Nany My 카드를 대표카드로 지정 하시겠습니까?"
 *   description="결제 시 우선으로 사용됩니다"
 *   confirmLabel="대표카드 설정하기"
 *   cancelLabel="닫기"
 *   onConfirm={handleConfirm}
 *   onCancel={() => setVisible(false)}
 *   onClose={() => setIsTwoButtonModalVisible(false)}
 * />
 */
export function Modal(modalProps: ModalProps) {
  const handleClose = modalProps.onClose;
  const keepAllTextStyle = {
    overflowWrap: 'normal',
    wordBreak: 'keep-all',
    wordWrap: 'normal',
  } as TextStyle;

  return (
    <RNModal
      animationType="fade"
      transparent
      visible={modalProps.visible}
      onRequestClose={handleClose}
    >
      <View className="flex-1 items-center justify-center bg-neutral-black3 px-9">
        {handleClose ? (
          <Pressable className="absolute inset-0" onPress={handleClose} />
        ) : null}

        <View className="w-full max-w-[320px] items-center rounded-3xl bg-neutral-white px-6 pb-6 pt-9">
          {modalProps.icon ? (
            <View className="mb-6">{modalProps.icon}</View>
          ) : null}

          <Text
            className="text-center font-pretendard text-heading-3 text-neutral-black1"
            style={keepAllTextStyle}
          >
            {keepAllText(modalProps.title)}
          </Text>

          {modalProps.description ? (
            <Text
              className="mt-3 text-center font-pretendard text-large-regular text-neutral-black2"
              style={keepAllTextStyle}
            >
              {keepAllText(modalProps.description)}
            </Text>
          ) : null}

          <View className="mt-7 w-full gap-3">
            <Button
              label={modalProps.confirmLabel}
              size="medium"
              onPress={modalProps.onConfirm}
            />

            {modalProps.type === 'two' ? (
              <Button
                label={modalProps.cancelLabel}
                variant="secondary"
                size="medium"
                onPress={modalProps.onCancel}
              />
            ) : null}
          </View>
        </View>
      </View>
    </RNModal>
  );
}

export default Modal;
