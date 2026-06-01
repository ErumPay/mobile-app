import { Text } from 'react-native';

import { Modal } from '../../../shared/components/Modal';

type DialogProps = {
  visible: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function LogoutDialog({ visible, onConfirm, onClose }: DialogProps) {
  return (
    <Modal
      visible={visible}
      type="two"
      icon={<Text className="text-[52px]">👋</Text>}
      title="로그아웃 하시겠습니까?"
      confirmLabel="로그아웃하기"
      cancelLabel="닫기"
      onConfirm={onConfirm}
      onCancel={onClose}
      onClose={onClose}
    />
  );
}

export function WithdrawDialog({ visible, onConfirm, onClose }: DialogProps) {
  return (
    <Modal
      visible={visible}
      type="two"
      icon={<Text className="text-[52px]">⚠️</Text>}
      title="정말 회원 탈퇴를 하시겠습니까?"
      description={'탈퇴 후 모든 데이터가 삭제되며\n복구할 수 없습니다'}
      confirmLabel="회원탈퇴하기"
      cancelLabel="닫기"
      onConfirm={onConfirm}
      onCancel={onClose}
      onClose={onClose}
    />
  );
}

export function DeleteCardDialog({ visible, onConfirm, onClose }: DialogProps) {
  return (
    <Modal
      visible={visible}
      type="two"
      icon={<Text className="text-[52px]">🗑️</Text>}
      title={'Nany My 카드를\n삭제하시겠습니까?'}
      confirmLabel="삭제하기"
      cancelLabel="닫기"
      onConfirm={onConfirm}
      onCancel={onClose}
      onClose={onClose}
    />
  );
}

export function DeleteCardCompleteDialog({
  visible,
  onConfirm,
  onClose,
}: DialogProps) {
  return (
    <Modal
      visible={visible}
      type="one"
      icon={<Text className="text-[52px]">✅</Text>}
      title="카드 삭제가 완료되었습니다."
      confirmLabel="확인"
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}

export function SetDefaultCardDialog({
  visible,
  onConfirm,
  onClose,
}: DialogProps) {
  return (
    <Modal
      visible={visible}
      type="two"
      icon={<Text className="text-[52px]">⭐</Text>}
      title={'Nany My 카드를\n대표카드로 지정 하시겠습니까?'}
      description="결제 시 우선으로 사용됩니다"
      confirmLabel="대표카드 설정하기"
      cancelLabel="닫기"
      onConfirm={onConfirm}
      onCancel={onClose}
      onClose={onClose}
    />
  );
}

export function EditCardAliasDialog({
  visible,
  onConfirm,
  onClose,
}: DialogProps) {
  return (
    <Modal
      visible={visible}
      type="two"
      icon={<Text className="text-[52px]">✏️</Text>}
      title={'Nany My 카드 별칭을\n수정하시겠습니까?'}
      confirmLabel="별칭 수정하기"
      cancelLabel="닫기"
      onConfirm={onConfirm}
      onCancel={onClose}
      onClose={onClose}
    />
  );
}
