import { useState } from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../../App';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { EmptyState } from '../../../shared/components/EmptyState';
import { Tab } from '../../../shared/components/Tab';
import { BottomSheet } from '../../../shared/components/BottomSheet';
import {
  MypageBottomNav,
  MypageFrame,
} from '../components/MypageLayout';
import { mockPaymentHistories } from '../mocks/mypageMockData';
import type { PaymentHistoryItem, PaymentStatus } from '../types/mypage';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentHistoryScreen'>;
type PaymentTab = 'all' | 'completed' | 'canceled';

const statusLabel: Record<PaymentStatus, string> = {
  completed: '결제완료',
  canceled: '결제취소',
  cancelRequested: '결제취소요청',
};

export function PaymentHistoryScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<PaymentTab>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredPayments = mockPaymentHistories.filter((payment) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'completed') return payment.status === 'completed';
    return payment.status === 'canceled' || payment.status === 'cancelRequested';
  });

  return (
    <>
      <MypageFrame
        title="결제내역"
        onBack={() => navigation.goBack()}
        backgroundClassName="bg-neutral-grey2"
      >
        <View className="gap-4 pb-28">
          <Tab
            items={[
              { label: '전체', value: 'all' },
              { label: '결제완료', value: 'completed' },
              { label: '결제취소', value: 'canceled' },
            ]}
            value={activeTab}
            onChange={(value) => setActiveTab(value as PaymentTab)}
          />

          <View className="flex-row items-center justify-between">
            <Text className="font-pretendard text-large-bold text-neutral-black1">
              총 {filteredPayments.length}건
            </Text>
            <Button
              label="필터"
              variant="secondary"
              onPress={() => setIsFilterOpen(true)}
            />
          </View>

          {filteredPayments.length > 0 ? (
            filteredPayments.map((payment) => (
              <PaymentItem
                key={payment.id}
                payment={payment}
                onPress={() =>
                  navigation.navigate('PaymentDetailScreen', {
                    paymentId: payment.id,
                  })
                }
              />
            ))
          ) : (
            <EmptyState title="결제 내역이 없습니다." />
          )}
        </View>
      </MypageFrame>

      <MypageBottomNav
        active="my"
        onChange={(value) => {
          if (value === 'home') navigation.navigate('Main');
        }}
      />

      <BottomSheet visible={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
        <View className="gap-4">
          <Text className="font-pretendard text-heading-3 text-neutral-black1">
            필터
          </Text>
          <Button label="이번 주" variant="secondary" />
          <Button label="이번 달" variant="secondary" />
          <Button label="결과보기" onPress={() => setIsFilterOpen(false)} />
        </View>
      </BottomSheet>
    </>
  );
}

function PaymentItem({
  payment,
  onPress,
}: {
  payment: PaymentHistoryItem;
  onPress: () => void;
}) {
  return (
    <Card onPress={onPress}>
      <View className="flex-row items-center">
        <Text className="rounded bg-neutral-grey2 px-2 py-1 font-pretendard text-normal-bold text-erum-secondary">
          {payment.method}
        </Text>
        <Text className="ml-3 font-pretendard text-normal-regular text-neutral-black2">
          {statusLabel[payment.status]}
        </Text>
      </View>
      <Text className="mt-4 font-pretendard text-large-bold text-neutral-black1">
        {payment.title}
      </Text>
      <View className="mt-4 flex-row items-center justify-between">
        <Text className="font-pretendard text-normal-regular text-neutral-black2">
          {payment.date}
        </Text>
        <Text className="font-pretendard text-heading-3 text-neutral-black1">
          {payment.amount}
        </Text>
      </View>
    </Card>
  );
}

export default PaymentHistoryScreen;
