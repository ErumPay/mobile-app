import { Feather } from '@expo/vector-icons';

import Modal from '../../../shared/components/Modal';
import { colors } from '../../../shared/styles/designTokens';

type PaymentStopConfirmModalProps = {
  visible: boolean;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function PaymentStopConfirmModal({
  visible,
  description,
  onConfirm,
  onCancel,
}: PaymentStopConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      type="two"
      icon={
        <Feather
          name="alert-triangle"
          size={52}
          color={colors.state.gold}
        />
      }
      title="결제를 중지하시겠습니까?"
      description={description}
      confirmLabel="예"
      cancelLabel="아니오"
      onConfirm={onConfirm}
      onCancel={onCancel}
      onClose={onCancel}
    />
  );
}
