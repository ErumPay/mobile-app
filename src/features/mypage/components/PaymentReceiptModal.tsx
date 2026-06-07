import { Feather } from '@expo/vector-icons';
import { Modal as RNModal, Pressable, ScrollView, Text, View } from 'react-native';

import { colors } from '../../../shared/styles/designTokens';
import type { PaymentDetail, PaymentStatus } from '../types/mypage';

const paymentStatusDisplay: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  completed: { label: '결제완료', className: 'text-erum-main' },
  canceled: { label: '결제취소', className: 'text-state-error' },
  cancelRequested: {
    label: '결제취소요청',
    className: 'text-state-orange',
  },
};

type PaymentReceiptModalProps = {
  visible: boolean;
  payment: PaymentDetail;
  onClose: () => void;
};

export function PaymentReceiptModal({
  visible,
  payment,
  onClose,
}: PaymentReceiptModalProps) {
  return (
    <RNModal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-center bg-neutral-black3 px-4 py-6">
        <View className="max-h-[90%] overflow-hidden rounded-2xl bg-neutral-white">
          <View className="h-12 flex-row items-center justify-end border-b border-neutral-grey1 px-4">
            <Pressable
              accessibilityRole="button"
              className="h-10 w-10 items-center justify-center"
              onPress={onClose}
            >
              <Feather name="x" size={28} color={colors.neutral.black1} />
            </Pressable>
          </View>

          <ScrollView
            className="px-6"
            contentContainerClassName="pb-6 pt-6"
            showsVerticalScrollIndicator={false}
          >
            <View className="items-center">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-erum-primary">
                <Text className="text-heading-1 text-neutral-white">₩</Text>
              </View>
              <Text className="mt-4 font-pretendard text-heading-2 text-neutral-black1">
                영수증
              </Text>
            </View>

            <View className="mt-6">
              <ReceiptRow
                label="결제상태"
                value={paymentStatusDisplay[payment.status].label}
                valueClassName={paymentStatusDisplay[payment.status].className}
              />
              <ReceiptRow label="결제일시" value={payment.paidAt} />
              <ReceiptRow label="영수증 ID" value={payment.receiptId} />
            </View>

            <Divider />

            <Text className="mb-4 font-pretendard text-heading-3 text-neutral-black1">
              판매자 정보
            </Text>
            <ReceiptRow label="판매자상호" value={payment.sellerName} />
            <ReceiptRow label="사업자번호" value={payment.businessNumber} />
            <ReceiptRow label="사업자주소" value={payment.address} />
            <ReceiptRow label="대표자명" value={payment.ownerName} />
            <ReceiptRow label="전화번호" value={payment.phone} />

            <View className="my-5 h-px w-full bg-state-error" />

            <ReceiptRow label="상품금액" value={payment.productAmount} />
            <ReceiptRow
              label="할인금액"
              value={payment.discountAmount}
              valueClassName="text-state-error"
            />
            <ReceiptRow label="부가세" value={payment.tax} />

            <View className="mt-5 items-center rounded-xl bg-neutral-grey2 py-5">
              <Text className="font-pretendard text-large-regular text-neutral-black2">
                총 결제금액
              </Text>
              <Text className="mt-2 font-pretendard text-heading-2 text-erum-secondary">
                {payment.finalAmount}
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </RNModal>
  );
}

function Divider() {
  return <View className="my-2 h-px w-full bg-neutral-grey1" />;
}

function ReceiptRow({
  label,
  value,
  valueClassName = 'text-neutral-black1',
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text className="font-pretendard text-large-regular text-neutral-black2">
        {label}
      </Text>
      <Text
        numberOfLines={2}
        className={`min-w-0 flex-1 text-right font-pretendard text-large-bold ${valueClassName}`}
      >
        {value}
      </Text>
    </View>
  );
}
