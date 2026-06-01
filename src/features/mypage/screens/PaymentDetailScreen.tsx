import { useState } from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../../App';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { FloatingButton } from '../../../shared/components/FloatingButton';
import { Header } from '../../../shared/components/Header';
import { Modal } from '../../../shared/components/Modal';
import { PageWrap } from '../../../shared/components/PageWrap';
import { mockPaymentDetails } from '../mocks/mypageMockData';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentDetailScreen'>;

export function PaymentDetailScreen({ navigation, route }: Props) {
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const payment =
    mockPaymentDetails[route.params.paymentId] ?? mockPaymentDetails['payment-1'];

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

      <Modal
        visible={isReceiptOpen}
        type="one"
        title="영수증"
        description={`결제일시: ${payment.paidAt}\n영수증 ID: ${payment.receiptId}\n최종결제금액: ${payment.finalAmount}`}
        confirmLabel="확인"
        onConfirm={() => setIsReceiptOpen(false)}
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

function Divider() {
  return <View className="my-2 h-px w-full bg-neutral-grey1" />;
}

export default PaymentDetailScreen;
