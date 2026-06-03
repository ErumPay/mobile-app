import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import { useState, useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SkeletonCard } from '../../../shared/components/Skeleton';
import type { RootStackParamList } from '../../../../App';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { EmptyState } from '../../../shared/components/EmptyState';
import { Tab } from '../../../shared/components/Tab';
import { BottomSheet } from '../../../shared/components/BottomSheet';

import { mockPaymentHistories } from '../mocks/mypageMockData';
import type {
  PaymentBenefitType,
  PaymentHistoryItem,
  PaymentMethodType,
  PaymentStatus,
} from '../types/mypage';

import { FloatingButton } from '../../../shared/components/FloatingButton';
import { Header } from '../../../shared/components/Header';
import { PageWrap } from '../../../shared/components/PageWrap';

import { Feather } from '@expo/vector-icons';



type Props = NativeStackScreenProps<RootStackParamList, 'PaymentHistoryScreen'>;
type PaymentTab = 'all' | 'completed' | 'canceled';
type PeriodFilter = 'week' | 'month' | 'year' | 'custom' | null;
type DatePickerTarget = 'start' | 'end' | null;

const statusLabel: Record<PaymentStatus, string> = {
  completed: '결제완료',
  canceled: '결제취소',
  cancelRequested: '결제취소요청',
};

const methodLabel: Record<PaymentMethodType, string> = {
  remote: '원격결제',
  dutchpay: '더치페이',
  solo: '혼자결제',
};

const benefitLabel: Record<PaymentBenefitType, string> = {
  singleBenefit: '단일혜택',
  singlePerformance: '단일실적',
  splitBenefit: '분할혜택',
  splitPerformance: '분할실적',
};

const methodClassName: Record<PaymentMethodType, string> = {
  remote: 'bg-purple-50 text-purple-600',
  dutchpay: 'bg-pink-50 text-pink-600',
  solo: 'bg-slate-100 text-slate-700',
};

const benefitClassName: Record<PaymentBenefitType, string> = {
  singleBenefit: 'bg-blue-50 text-blue-600',
  singlePerformance: 'bg-sky-50 text-sky-600',
  splitBenefit: 'bg-emerald-50 text-emerald-600',
  splitPerformance: 'bg-lime-50 text-lime-700',
};


export function PaymentHistoryScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<PaymentTab>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(null);
  const [selectedBenefit, setSelectedBenefit] = useState<PaymentBenefitType | null>(null);
  const [appliedPeriod, setAppliedPeriod] = useState<PeriodFilter>(null);
  const [appliedMethod, setAppliedMethod] = useState<PaymentMethodType | null>(null);
  const [appliedBenefit, setAppliedBenefit] = useState<PaymentBenefitType | null>(null);

  const [startDate, setStartDate] = useState(() => new Date(2026, 3, 30));
  const [endDate, setEndDate] = useState(() => new Date(2026, 4, 1));
  const [datePickerTarget, setDatePickerTarget] = useState<DatePickerTarget>(null);
  const isFilterApplied =
    appliedPeriod !== null || appliedMethod !== null || appliedBenefit !== null;
  const handlePressFilter = () => {
    if (isFilterApplied) {
      setSelectedPeriod(null);
      setSelectedMethod(null);
      setSelectedBenefit(null);
      setAppliedPeriod(null);
      setAppliedMethod(null);
      setAppliedBenefit(null);
      setIsFilterOpen(false);
      return;
    }

    setIsFilterOpen(true);
  };

  const handleChangeDate = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (event.type === 'dismissed') {
      setDatePickerTarget(null);
      return;
    }

    if (!selectedDate || !datePickerTarget) {
      return;
    }

    if (datePickerTarget === 'start') {
      setStartDate(selectedDate);
    }

    if (datePickerTarget === 'end') {
      setEndDate(selectedDate);
    }

    setSelectedPeriod('custom');
    setDatePickerTarget(null);
  };

  const filteredPayments = mockPaymentHistories.filter((payment) => {
    const isTabMatched =
      activeTab === 'all'
        ? true
        : activeTab === 'completed'
          ? payment.status === 'completed'
          : payment.status === 'canceled' || payment.status === 'cancelRequested';

    const isPeriodMatched = appliedPeriod
      ? isPaymentInPeriod(payment.date, appliedPeriod, startDate, endDate)
      : true;

    const isMethodMatched = appliedMethod
      ? payment.method === appliedMethod
      : true;

    const isBenefitMatched = appliedBenefit
      ? payment.benefitType === appliedBenefit
      : true;

    return isTabMatched && isPeriodMatched && isMethodMatched && isBenefitMatched;
  });

  return (
    <>
      <PageWrap
        backgroundClassName="bg-neutral-grey2"
        header={
          <Header
            title="결제내역"
            type="back"
            onPressLeft={() => navigation.goBack()}
          />
        }
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

            <Pressable
              accessibilityRole="button"
              className="h-8 w-8 items-center justify-center rounded-full bg-[#2F62A3]"
              onPress={handlePressFilter}
            >
              <Feather name="filter" size={18} color="#FFFFFF" />
            </Pressable>
          </View>

          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : filteredPayments.length > 0 ? (
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
      </PageWrap>

      <FloatingButton
        value="my"
        onChange={(value) => {
          if (value === 'home') navigation.navigate('Main');
          if (value === 'payment') navigation.navigate('PaymentMethodSelect');
          if (value === 'my') navigation.navigate('MypageHomeScreen');
        }}
      />

      <BottomSheet
        visible={isFilterOpen}
        title="필터"
        onClose={() => setIsFilterOpen(false)}
      >
        <View className="gap-7">
          <View>
            <Text className="mb-4 font-pretendard text-heading-3 text-neutral-black1">
              기간
            </Text>

            <View className="flex-row gap-3">
              <FilterChip
                label="이번주"
                active={selectedPeriod === 'week'}
                onPress={() => setSelectedPeriod('week')}
              />
              <FilterChip
                label="이번달"
                active={selectedPeriod === 'month'}
                onPress={() => setSelectedPeriod('month')}
              />
              <FilterChip
                label="올해"
                active={selectedPeriod === 'year'}
                onPress={() => setSelectedPeriod('year')}
              />
            </View>
          </View>

          <View>
            <Text className="mb-4 font-pretendard text-heading-3 text-neutral-black1">
              기간 선택
            </Text>

            <View className="flex-row gap-3">
              <DateBox
                label={formatDate(startDate)}
                active={selectedPeriod === 'custom'}
                onPress={() => setDatePickerTarget('start')}
              />

              <DateBox
                label={formatDate(endDate)}
                active={selectedPeriod === 'custom'}
                onPress={() => setDatePickerTarget('end')}
              />
            </View>
            {datePickerTarget ? (
              <DateTimePicker
                value={datePickerTarget === 'start' ? startDate : endDate}
                mode="date"
                display="default"
                onChange={handleChangeDate}
              />
            ) : null}
          </View>

          <View>
            <Text className="mb-4 font-pretendard text-heading-3 text-neutral-black1">
              결제수단
            </Text>

            <View className="flex-row flex-wrap gap-y-3">
              <View className="w-1/3 pr-2">
                <FilterChip
                  label="더치페이"
                  active={selectedMethod === 'dutchpay'}
                  onPress={() => setSelectedMethod('dutchpay')}
                />
              </View>

              <View className="w-1/3 px-1">
                <FilterChip
                  label="원격결제"
                  active={selectedMethod === 'remote'}
                  onPress={() => setSelectedMethod('remote')}
                />
              </View>

              <View className="w-1/3 pl-2">
                <FilterChip
                  label="혼자결제"
                  active={selectedMethod === 'solo'}
                  onPress={() => setSelectedMethod('solo')}
                />
              </View>
            </View>
          </View>

          <View>
            <Text className="mb-4 font-pretendard text-heading-3 text-neutral-black1">
              적용 유형
            </Text>

            <View className="flex-row flex-wrap gap-y-3">
              <View className="w-1/3 pr-2">
                <FilterChip
                  label="단일혜택"
                  active={selectedBenefit === 'singleBenefit'}
                  onPress={() => setSelectedBenefit('singleBenefit')}
                />
              </View>

              <View className="w-1/3 pr-2">
                <FilterChip
                  label="단일실적"
                  active={selectedBenefit === 'singlePerformance'}
                  onPress={() => setSelectedBenefit('singlePerformance')}
                />
              </View>

              <View className="w-1/3 px-1">
                <FilterChip
                  label="분할혜택"
                  active={selectedBenefit === 'splitBenefit'}
                  onPress={() => setSelectedBenefit('splitBenefit')}
                />
              </View>

              <View className="w-1/3 pl-2">
                <FilterChip
                  label="분할실적"
                  active={selectedBenefit === 'splitPerformance'}
                  onPress={() => setSelectedBenefit('splitPerformance')}
                />
              </View>
            </View>
          </View>

          <Button
            label="결과보기"
            onPress={() => {
              setAppliedPeriod(selectedPeriod);
              setAppliedMethod(selectedMethod);
              setAppliedBenefit(selectedBenefit);
              setIsFilterOpen(false);
            }}
          />
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
        <View className="flex-row gap-2">
          <Text
            className={`rounded px-2 py-1 font-pretendard text-normal-bold ${
              methodClassName[payment.method]
            }`}
          >
            {methodLabel[payment.method]}
          </Text>
          <Text
            className={`rounded px-2 py-1 font-pretendard text-normal-bold ${
              benefitClassName[payment.benefitType]
            }`}
          >
            {benefitLabel[payment.benefitType]}
          </Text>
        </View>
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

function FilterChip({
  label,
  active = false,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`h-11 flex-1 items-center justify-center rounded-full ${
        active ? 'bg-[#2F62A3]' : 'bg-neutral-grey3'
      }`}
      onPress={onPress}
    >
      <Text
        className={`font-pretendard text-large-bold ${
          active ? 'text-neutral-white' : 'text-neutral-black2'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function DateBox({
  label,
  active = false,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`h-12 flex-1 justify-center rounded-xl border px-4 ${
        active
          ? 'border-[#2F62A3] bg-neutral-white'
          : 'border-neutral-grey1 bg-neutral-white'
      }`}
      onPress={onPress}
    >
      <Text className="font-pretendard text-large-regular text-neutral-black1">
        {label}
      </Text>
    </Pressable>
  );
}

function isPaymentInPeriod(
  dateText: string,
  period: PeriodFilter,
  startDate: Date,
  endDate: Date,
) {
  if (!period) return true;

  const paymentDate = parseDateText(dateText);
  const today = new Date();

  if (period === 'week') {
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return paymentDate >= startOfDay(startOfWeek) && paymentDate <= endOfDay(endOfWeek);
  }

  if (period === 'month') {
    return (
      paymentDate.getFullYear() === today.getFullYear() &&
      paymentDate.getMonth() === today.getMonth()
    );
  }

  if (period === 'year') {
    return paymentDate.getFullYear() === today.getFullYear();
  }

  if (period === 'custom') {
    return paymentDate >= startOfDay(startDate) && paymentDate <= endOfDay(endDate);
  }

  return true;
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}.${month}.${day}`;
}

function parseDateText(dateText: string) {
  const [year, month, day] = dateText.split('.').map(Number);
  return new Date(year, month - 1, day);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
}

export default PaymentHistoryScreen;
