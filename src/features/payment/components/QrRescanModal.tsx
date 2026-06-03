import { Feather } from '@expo/vector-icons';

import Modal from '../../../shared/components/Modal';
import { colors } from '../../../shared/styles/designTokens';

type QrRescanModalProps = {
  visible: boolean;
  onConfirm: () => void;
};

export default function QrRescanModal({
  visible,
  onConfirm,
}: QrRescanModalProps) {
  return (
    <Modal
      visible={visible}
      type="one"
      icon={
        <Feather
          name="alert-triangle"
          size={52}
          color={colors.state.gold}
        />
      }
      title="QR을 다시 스캔해주세요."
      confirmLabel="다시 스캔하기"
      onConfirm={onConfirm}
      onClose={onConfirm}
    />
  );
}
