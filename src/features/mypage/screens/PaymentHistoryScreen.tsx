import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { createElement, useCallback, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import type { RootStackParamList } from '../../../../App';
import { BottomSheet } from '../../../shared/components/BottomSheet';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { EmptyState } from '../../../shared/components/EmptyState';
import { FloatingButton } from '../../../shared/components/FloatingButton';
import { Header } from '../../../shared/components/Header';
import { PageWrap } from '../../../shared/components/PageWrap';
import { SkeletonCard } from '../../../shared/components/Skeleton';
import { Tab } from '../../../shared/components/Tab';
import { fetchPaymentHistories } from '../api/mypageApi';
import type {
  PaymentBenefitType,
  PaymentHistoryItem,
  PaymentMethodType,
  PaymentStatus,
} from '../types/mypage';

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
  solo: '일반결제',
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
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<PaymentTab>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(null);
  const [selectedBenefit, setSelectedBenefit] = useState<PaymentBenefitType | null>(null);
  const [appliedPeriod, setAppliedPeriod] = useState<PeriodFilter>(null);
  const [appliedMethod, setAppliedMethod] = useState<PaymentMethodType | null>(null);
  const [appliedBenefit, setAppliedBenefit] = useState<PaymentBenefitType | null>(null);
  const [startDate, setStartDate] = useState(getDefaultStartDate);
  const [endDate, setEndDate] = useState(getDefaultEndDate);
  const [appliedStartDate, setAppliedStartDate] = useState(getDefaultStartDate);
  const [appliedEndDate, setAppliedEndDate] = useState(getDefaultEndDate);
  const [datePickerTarget, setDatePickerTarget] = useState<DatePickerTarget>(null);

  const loadPayments = useCallback(() => {
    let isActive = true;

    setIsLoading(true);
    fetchPaymentHistories({
      status: toPaymentStatusParam(activeTab),
      ...toPeriodParams(appliedPeriod, appliedStartDate, appliedEndDate),
      paymentType: toPaymentTypeParam(appliedMethod),
      strategyType: toStrategyTypeParam(appliedBenefit),
    })
      .then((nextPayments) => {
        if (isActive) {
          setPayments(nextPayments);
        }
      })
      .catch((error) => {
        console.warn('Failed to fetch payment histories.', error);
        if (isActive) {
          setPayments([]);
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
  }, [
    activeTab,
    appliedBenefit,
    appliedEndDate,
    appliedMethod,
    appliedPeriod,
    appliedStartDate,
  ]);

  useFocusEffect(loadPayments);

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

  const applySelectedDate = (
    target: Exclude<DatePickerTarget, null>,
    selectedDate: Date,
  ) => {
    if (target === 'start') setStartDate(selectedDate);
    if (target === 'end') setEndDate(selectedDate);
    setSelectedPeriod('custom');
  };

  const handleChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setDatePickerTarget(null);
      return;
    }

    if (!selectedDate || !datePickerTarget) return;
    applySelectedDate(datePickerTarget, selectedDate);
    setDatePickerTarget(null);
  };

  const handleOpenDatePicker = (target: Exclude<DatePickerTarget, null>) => {
    const value = target === 'start' ? startDate : endDate;
    setSelectedPeriod('custom');

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value,
        mode: 'date',
        onChange: (event, selectedDate) => {
          if (event.type === 'dismissed' || !selectedDate) return;
          applySelectedDate(target, selectedDate);
        },
      });
      return;
    }

    setDatePickerTarget(target);
  };

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
              총 {payments.length}건
            </Text>

            <Pressable
              accessibilityRole="button"
              className="h-8 w-8 items-center justify-center rounded-full bg-[#2F62A3]"
              onPress={handlePressFilter}
            >
              <Feather name={isFilterApplied ? 'x' : 'filter'} size={18} color="#FFFFFF" />
            </Pressable>
          </View>

          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : payments.length > 0 ? (
            payments.map((payment) => (
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
          <FilterSection title="기간">
            <View className="flex-row gap-3">
              <FilterChip
                label="이번 주"
                active={selectedPeriod === 'week'}
                onPress={() => setSelectedPeriod('week')}
              />
              <FilterChip
                label="이번 달"
                active={selectedPeriod === 'month'}
                onPress={() => setSelectedPeriod('month')}
              />
              <FilterChip
                label="올해"
                active={selectedPeriod === 'year'}
                onPress={() => setSelectedPeriod('year')}
              />
            </View>
          </FilterSection>

          <FilterSection title="기간 선택">
            <View className="flex-row gap-3">
              <DateBox
                label={formatDate(startDate)}
                active={selectedPeriod === 'custom'}
                onPress={() => handleOpenDatePicker('start')}
                value={startDate}
                onChangeDate={(date) => applySelectedDate('start', date)}
              />
              <DateBox
                label={formatDate(endDate)}
                active={selectedPeriod === 'custom'}
                onPress={() => handleOpenDatePicker('end')}
                value={endDate}
                onChangeDate={(date) => applySelectedDate('end', date)}
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
          </FilterSection>

          <FilterSection title="결제수단">
            <View className="flex-row flex-wrap gap-y-3">
              <FilterCell>
                <FilterChip
                  label="더치페이"
                  active={selectedMethod === 'dutchpay'}
                  onPress={() => setSelectedMethod('dutchpay')}
                />
              </FilterCell>
              <FilterCell>
                <FilterChip
                  label="원격결제"
                  active={selectedMethod === 'remote'}
                  onPress={() => setSelectedMethod('remote')}
                />
              </FilterCell>
              <FilterCell>
                <FilterChip
                  label="일반결제"
                  active={selectedMethod === 'solo'}
                  onPress={() => setSelectedMethod('solo')}
                />
              </FilterCell>
            </View>
          </FilterSection>

          <FilterSection title="적용 유형">
            <View className="flex-row flex-wrap gap-y-3">
              <FilterHalfCell>
                <FilterChip
                  label="단일혜택"
                  active={selectedBenefit === 'singleBenefit'}
                  onPress={() => setSelectedBenefit('singleBenefit')}
                />
              </FilterHalfCell>
              <FilterHalfCell>
                <FilterChip
                  label="단일실적"
                  active={selectedBenefit === 'singlePerformance'}
                  onPress={() => setSelectedBenefit('singlePerformance')}
                />
              </FilterHalfCell>
              <FilterHalfCell>
                <FilterChip
                  label="분할혜택"
                  active={selectedBenefit === 'splitBenefit'}
                  onPress={() => setSelectedBenefit('splitBenefit')}
                />
              </FilterHalfCell>
              <FilterHalfCell>
                <FilterChip
                  label="분할실적"
                  active={selectedBenefit === 'splitPerformance'}
                  onPress={() => setSelectedBenefit('splitPerformance')}
                />
              </FilterHalfCell>
            </View>
          </FilterSection>

          <Button
            label="결과보기"
            onPress={() => {
              setAppliedPeriod(selectedPeriod);
              setAppliedMethod(selectedMethod);
              setAppliedBenefit(selectedBenefit);
              setAppliedStartDate(startDate);
              setAppliedEndDate(endDate);
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
          <Text className={`rounded px-2 py-1 font-pretendard text-normal-bold ${methodClassName[payment.method]}`}>
            {methodLabel[payment.method]}
          </Text>
          <Text className={`rounded px-2 py-1 font-pretendard text-normal-bold ${benefitClassName[payment.benefitType]}`}>
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

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View>
      <Text className="mb-4 font-pretendard text-heading-3 text-neutral-black1">
        {title}
      </Text>
      {children}
    </View>
  );
}

function FilterCell({ children }: { children: React.ReactNode }) {
  return <View className="w-1/3 px-1">{children}</View>;
}

function FilterHalfCell({ children }: { children: React.ReactNode }) {
  return <View className="w-1/2 px-1">{children}</View>;
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
      <Text className={`font-pretendard text-large-bold ${active ? 'text-neutral-white' : 'text-neutral-black2'}`}>
        {label}
      </Text>
    </Pressable>
  );
}

function DateBox({
  label,
  active = false,
  onPress,
  value,
  onChangeDate,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  value?: Date;
  onChangeDate?: (date: Date) => void;
}) {
  if (Platform.OS === 'web' && value && onChangeDate) {
    return (
      <View className="flex-1">
        {createElement('input', {
          'aria-label': label,
          type: 'date',
          value: formatDateInputValue(value),
          onChange: (event: { currentTarget: { value: string } }) => {
            const nextDate = parseDateInputValue(event.currentTarget.value);
            if (nextDate) onChangeDate(nextDate);
          },
          style: {
            width: '100%',
            height: 48,
            boxSizing: 'border-box',
            borderRadius: 12,
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: active ? '#2F62A3' : '#D8DDE5',
            backgroundColor: '#FFFFFF',
            paddingLeft: 16,
            paddingRight: 16,
            color: '#111827',
            fontFamily: 'Pretendard',
            fontSize: 16,
            outlineColor: '#2F62A3',
          },
        })}
      </View>
    );
  }

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

function toPaymentStatusParam(tab: PaymentTab) {
  if (tab === 'completed') return 'PAID' as const;
  if (tab === 'canceled') return 'CANCELED' as const;
  return 'ALL' as const;
}

function toPaymentTypeParam(method: PaymentMethodType | null) {
  if (method === 'remote') return 'REMOTE' as const;
  if (method === 'dutchpay') return 'DUTCH' as const;
  if (method === 'solo') return 'SINGLE' as const;
  return undefined;
}

function toStrategyTypeParam(benefit: PaymentBenefitType | null) {
  if (benefit === 'singleBenefit') return 'BENEFIT_SINGLE' as const;
  if (benefit === 'splitBenefit') return 'BENEFIT_SPLIT' as const;
  if (benefit === 'singlePerformance') return 'PERF_SINGLE' as const;
  if (benefit === 'splitPerformance') return 'PERF_SPLIT' as const;
  return undefined;
}

function toPeriodParams(period: PeriodFilter, startDate: Date, endDate: Date) {
  if (period === 'week') return { period: 'WEEK' as const };
  if (period === 'month') return { period: 'MONTH' as const };
  if (period === 'year') return { period: 'YEAR' as const };
  if (period === 'custom') {
    return {
      start: formatDateInputValue(startDate),
      end: formatDateInputValue(endDate),
    };
  }

  return {};
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}.${month}.${day}`;
}

function formatDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateInputValue(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function getDefaultStartDate() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1);
}

function getDefaultEndDate() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

export default PaymentHistoryScreen;
