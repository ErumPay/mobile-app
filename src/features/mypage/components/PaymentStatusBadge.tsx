import { Text, View } from 'react-native';

import type { PaymentStatus } from '../types/mypage';

const statusLabel: Record<PaymentStatus, string> = {
  completed: '결제완료',
  canceled: '결제취소',
  cancelRequested: '결제취소요청',
};

const badgeClassName: Record<PaymentStatus, string> = {
  completed: 'border-erum-main',
  canceled: 'border-state-error',
  cancelRequested: 'border-state-orange',
};

const textClassName: Record<PaymentStatus, string> = {
  completed: 'text-erum-main',
  canceled: 'text-state-error',
  cancelRequested: 'text-state-orange',
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <View
      className={`shrink-0 rounded-full border bg-neutral-white px-2.5 py-1 ${badgeClassName[status]}`}
    >
      <Text className={`font-pretendard text-normal-bold ${textClassName[status]}`}>
        {statusLabel[status]}
      </Text>
    </View>
  );
}

