import { Modal as RNModal, Pressable, Text, View, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import type { ReactNode } from 'react';

import type { RootStackParamList } from '../../../../App';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { FloatingButton } from '../../../shared/components/FloatingButton';
import { Header } from '../../../shared/components/Header';
import { PageWrap } from '../../../shared/components/PageWrap';
import { mockManagedCards, mockPaymentDetails } from '../mocks/mypageMockData';
import type { PaymentBenefitType, PaymentMethodType } from '../types/mypage';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentDetailScreen'>;

const paymentMethodLabel: Record<PaymentMethodType, string> = {
  remote: '원격결제',
  dutchpay: '더치페이',
  solo: '혼자결제',
};

const paymentBenefitLabel: Record<PaymentBenefitType, string> = {
  singleBenefit: '단일혜택',
  singlePerformance: '단일실적',
  splitBenefit: '분할혜택',
  splitPerformance: '분할실적',
};

const paymentMethodClassName: Record<PaymentMethodType, string> = {
  remote: 'bg-purple-50 text-purple-600',
  dutchpay: 'bg-pink-50 text-pink-600',
  solo: 'bg-slate-100 text-slate-700',
};

const paymentBenefitClassName: Record<PaymentBenefitType, string> = {
  singleBenefit: 'bg-blue-50 text-blue-600',
  singlePerformance: 'bg-sky-50 text-sky-600',
  splitBenefit: 'bg-emerald-50 text-emerald-600',
  splitPerformance: 'bg-lime-50 text-lime-700',
};

export function PaymentDetailScreen({ navigation, route }: Props) {
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const payment =
    mockPaymentDetails[route.params.paymentId] ?? mockPaymentDetails['payment-1'];
  const paymentCardIds = payment.cardIds ?? [payment.cardId];
  const paymentCards = paymentCardIds
    .map((cardId) => mockManagedCards.find((card) => card.id === cardId))
    .filter((card): card is NonNullable<typeof card> => Boolean(card));

  return (
    <>
      <PageWrap
        backgroundClassName="bg-neutral-grey2"
        header={
          <Header
            title="결제내역 상세보기"
            type="back"
            onPressLeft={() => navigation.goBack()}
          />
        }
      >
        <View className="gap-4 pb-28">
          <Card>
            <View className="items-center py-2">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-erum-primary">
                <Text className="text-heading-1 text-neutral-white">✓</Text>
              </View>
              <Text className="mt-4 text-center font-pretendard text-large-regular text-neutral-black2">
                이번 결제로 {payment.discountAmount.replace('-', '')} 아꼈어요!
              </Text>
            </View>
          </Card>

          <Card title="결제 정보">
            <InfoRow
              label="카드명"
              value={paymentCards.map((card) => card.name).join('\n') || '등록 카드'}
            />
            <InfoRow
              label="카드번호"
              value={paymentCards.map((card) => card.cardNumber).join('\n') || '-'}
            />
            <BadgeInfoRow label="결제 방식">
              <Badge
                label={paymentMethodLabel[payment.method]}
                className={paymentMethodClassName[payment.method]}
              />
              <Badge
                label={paymentBenefitLabel[payment.benefitType]}
                className={paymentBenefitClassName[payment.benefitType]}
              />
            </BadgeInfoRow>
            <InfoRow label="결제상태" value="결제완료" valueClassName="text-erum-main" />
            <InfoRow label="결제일시" value={payment.paidAt} />
            <InfoRow label="영수증 ID" value={payment.receiptId} />
          </Card>

          <Card title="판매자 정보">
            <InfoRow label="판매자상호" value={payment.sellerName} />
            <InfoRow label="사업자번호" value={payment.businessNumber} />
            <InfoRow label="사업자주소" value={payment.address} />
            <InfoRow label="대표자명" value={payment.ownerName} />
            <InfoRow label="전화번호" value={payment.phone} />
          </Card>

          <Card title="금액 정보">
            <InfoRow label="상품금액" value={payment.productAmount} />
            <InfoRow label="할인금액" value={payment.discountAmount} valueClassName="text-state-error" />
            <Divider />
            <InfoRow label="부가세" value={payment.tax} />
            <Divider />
            <InfoRow label="최종결제금액" value={payment.finalAmount} valueClassName="text-erum-secondary" />
          </Card>

          <Button label="전자영수증" onPress={() => setIsReceiptOpen(true)} />
        </View>
      </PageWrap>

      <FloatingButton
        value="my"
        onChange={(value) => {
          if (value === 'home') navigation.navigate('Main');
          if (value === 'payment') navigation.navigate('PaymentMethodSelect');
          if (value === 'my') navigation.navigate('MypageHomeScreen');
        }}
      />

      <ReceiptModal
        visible={isReceiptOpen}
        payment={payment}
        onClose={() => setIsReceiptOpen(false)}
      />
    </>
  );
}

function InfoRow({
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

function BadgeInfoRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text className="font-pretendard text-large-regular text-neutral-black2">
        {label}
      </Text>
      <View className="min-w-0 flex-1 flex-row justify-end gap-2">
        {children}
      </View>
    </View>
  );
}

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <Text className={`rounded px-2 py-1 font-pretendard text-normal-bold ${className}`}>
      {label}
    </Text>
  );
}

function Divider() {
  return <View className="my-2 h-px w-full bg-neutral-grey1" />;
}

function ReceiptModal({
  visible,
  payment,
  onClose,
}: {
  visible: boolean;
  payment: typeof mockPaymentDetails['payment-1'];
  onClose: () => void;
}) {
  return (
    <RNModal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center bg-neutral-black3 px-4 py-6">
        <View className="max-h-[90%] rounded-2xl bg-neutral-white overflow-hidden">
          <View className="h-12 flex-row items-center justify-end border-b border-neutral-grey1 px-4">
            <Pressable
              accessibilityRole="button"
              className="h-10 w-10 items-center justify-center"
              onPress={onClose}
            >
              <Text className="text-heading-2 text-neutral-black1">×</Text>
            </Pressable>
          </View>

          <ScrollView
            className="px-6"
            contentContainerClassName="pb-6 pt-6"
            showsVerticalScrollIndicator={false}
          >

          <View className="items-center">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-erum-primary">
              <Text className="text-heading-1 text-neutral-white">✓</Text>
            </View>

            <Text className="mt-4 font-pretendard text-heading-2 text-neutral-black1">
              영수증
            </Text>
          </View>

          <View className="mt-6">
            <ReceiptRow label="결제상태" value="결제완료" valueClassName="text-erum-main" />
            <ReceiptRow label="결제일시" value={payment.paidAt} />
            <ReceiptRow label="영수증ID" value={payment.receiptId} />
          </View>

          <Divider />

          <Text className="mb-4 font-pretendard text-heading-3 text-neutral-black1">
            판매자상호 및 정보
          </Text>

          <ReceiptRow label="판매자상호" value={payment.sellerName} />
          <ReceiptRow label="사업자번호" value={payment.businessNumber} />
          <ReceiptRow label="사업자주소" value={payment.address} />
          <ReceiptRow label="대표자명" value={payment.ownerName} />
          <ReceiptRow label="전화번호" value={payment.phone} />

          <View className="my-5 h-px w-full bg-state-error" />

          <ReceiptRow label="상품금액" value={payment.productAmount} />
          <ReceiptRow label="할인금액" value={payment.discountAmount} valueClassName="text-state-error" />
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

export default PaymentDetailScreen;
