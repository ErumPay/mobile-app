import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Modal as RNModal, Pressable, ScrollView, Text, View } from 'react-native';

import type { RootStackParamList } from '../../../../App';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { EmptyState } from '../../../shared/components/EmptyState';
import { FloatingButton } from '../../../shared/components/FloatingButton';
import { Header } from '../../../shared/components/Header';
import { PageWrap } from '../../../shared/components/PageWrap';
import { SkeletonCard } from '../../../shared/components/Skeleton';
import { fetchPaymentDetail } from '../api/mypageApi';
import type { PaymentBenefitType, PaymentDetail, PaymentMethodType } from '../types/mypage';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentDetailScreen'>;

const paymentMethodLabel: Record<PaymentMethodType, string> = {
  remote: '원격결제',
  dutchpay: '더치페이',
  solo: '일반결제',
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
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  useEffect(() => {
    let isActive = true;

    setIsLoading(true);
    fetchPaymentDetail(route.params.paymentId)
      .then((nextPayment) => {
        if (isActive) {
          setPayment(nextPayment);
        }
      })
      .catch((error) => {
        console.warn('Failed to fetch payment detail.', error);
        if (isActive) {
          setPayment(null);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [route.params.paymentId]);

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
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : payment ? (
            <>
              <Card>
                <View className="items-center py-2">
                  <View className="h-16 w-16 items-center justify-center rounded-full bg-erum-primary">
                    <Text className="text-heading-1 text-neutral-white">₩</Text>
                  </View>
                  <Text className="mt-4 text-center font-pretendard text-large-regular text-neutral-black2">
                    이번 결제에서 {payment.discountAmount.replace('-', '')} 절약했어요.
                  </Text>
                </View>
              </Card>

              <Card title="결제 정보">
                <InfoRow label="주문명" value={payment.title} />
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
                <InfoRow
                  label="결제상태"
                  value={payment.status === 'canceled' ? '결제취소' : '결제완료'}
                  valueClassName={
                    payment.status === 'canceled'
                      ? 'text-state-error'
                      : 'text-erum-main'
                  }
                />
                <InfoRow label="결제일시" value={payment.paidAt} />
                <InfoRow label="영수증 ID" value={payment.receiptId} />
              </Card>

              <Card title="카드 정보">
                <PaymentCardInfoRows payment={payment} />
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
                <InfoRow
                  label="할인금액"
                  value={payment.discountAmount}
                  valueClassName="text-state-error"
                />
                <Divider />
                <InfoRow label="부가세" value={payment.tax} />
                <Divider />
                <InfoRow
                  label="최종결제금액"
                  value={payment.finalAmount}
                  valueClassName="text-erum-secondary"
                />
              </Card>

              <Button label="전자영수증" onPress={() => setIsReceiptOpen(true)} />
            </>
          ) : (
            <EmptyState title="결제 정보를 찾을 수 없습니다." />
          )}
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

      {payment ? (
        <ReceiptModal
          visible={isReceiptOpen}
          payment={payment}
          onClose={() => setIsReceiptOpen(false)}
        />
      ) : null}
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

function PaymentCardInfoRows({ payment }: { payment: PaymentDetail }) {
  const cards = payment.cards ?? [];

  if (cards.length === 0) {
    return <InfoRow label="카드 정보" value="-" />;
  }

  return (
    <View className="gap-2">
      {cards.map((card, index) => (
        <View
          key={`${card.id || card.maskedNumber}-${index}`}
          className="rounded bg-neutral-white px-3 py-2"
        >
          <InfoRow label="카드명" value={card.name} />
          <InfoRow label="카드번호" value={card.maskedNumber} />
        </View>
      ))}
    </View>
  );
}

function BadgeInfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
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
  payment: PaymentDetail;
  onClose: () => void;
}) {
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
                <Text className="text-heading-1 text-neutral-white">₩</Text>
              </View>
              <Text className="mt-4 font-pretendard text-heading-2 text-neutral-black1">
                영수증
              </Text>
            </View>

            <View className="mt-6">
              <ReceiptRow
                label="결제상태"
                value={payment.status === 'canceled' ? '결제취소' : '결제완료'}
                valueClassName={
                  payment.status === 'canceled'
                    ? 'text-state-error'
                    : 'text-erum-main'
                }
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
