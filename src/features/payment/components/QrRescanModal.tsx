import { Feather } from '@expo/vector-icons';

import Modal from '../../../shared/components/Modal';
import { colors } from '../../../shared/styles/designTokens';

type QrRescanModalProps = {
  visible: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
};

export default function QrRescanModal({
  visible,
  title = 'QR을 다시 스캔해주세요.',
  description,
  confirmLabel = '다시 스캔하기',
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
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      onConfirm={onConfirm}
      onClose={onConfirm}
    />
  );
}
