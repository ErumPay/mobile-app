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
import { PaymentStatusBadge } from '../components/PaymentStatusBadge';
import type {
  PaymentBenefitType,
  PaymentHistoryItem,
  PaymentMethodType,
} from '../types/mypage';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentHistoryScreen'>;
type PaymentTab = 'all' | 'completed' | 'canceled';
type PeriodFilter = 'week' | 'month' | 'year' | 'custom' | null;
type DatePickerTarget = 'start' | 'end' | null;
const MAX_CUSTOM_RANGE_YEARS = 3;

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
  const [hasLoadError, setHasLoadError] = useState(false);
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
  const [filterErrorMessage, setFilterErrorMessage] = useState('');

  const loadPayments = useCallback(() => {
    let isActive = true;

    setIsLoading(true);
    setHasLoadError(false);
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
          setHasLoadError(true);
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
    setFilterErrorMessage('');
    const today = getTodayDate();
    const normalizedDate = normalizeDate(selectedDate);

    if (target === 'start') {
      if (normalizedDate > today) {
        setFilterErrorMessage('오늘 이후 날짜는 선택할 수 없습니다.');
        return;
      }

      const maxEndDate = getEarlierDate(
        getYearDiffDate(normalizedDate, MAX_CUSTOM_RANGE_YEARS),
        today,
      );

      setStartDate(normalizedDate);

      if (normalizedDate > endDate) {
        setEndDate(normalizedDate);
      } else if (endDate > maxEndDate) {
        setEndDate(maxEndDate);
      }
    }

    if (target === 'end') {
      if (getYearDiffDate(startDate, MAX_CUSTOM_RANGE_YEARS) < normalizedDate) {
        setFilterErrorMessage(
          `최대 ${MAX_CUSTOM_RANGE_YEARS}년 범위까지만 조회할 수 있습니다.`,
        );
        return;
      }

      if (normalizedDate > today) {
        setFilterErrorMessage('오늘 이후 날짜는 선택할 수 없습니다.');
        return;
      }

      const minStartDate = getYearDiffDate(
        normalizedDate,
        -MAX_CUSTOM_RANGE_YEARS,
      );

      setEndDate(normalizedDate);

      if (normalizedDate < startDate) {
        setStartDate(normalizedDate);
      } else if (startDate < minStartDate) {
        setStartDate(minStartDate);
      }
    }

    setSelectedPeriod('custom');
  };

  const handleApplyFilter = () => {
    const validationMessage = validateCustomDateRange(startDate, endDate);

    if (selectedPeriod === 'custom' && validationMessage) {
      setFilterErrorMessage(validationMessage);
      return;
    }

    setAppliedPeriod(selectedPeriod);
    setAppliedMethod(selectedMethod);
    setAppliedBenefit(selectedBenefit);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setFilterErrorMessage('');
    setIsFilterOpen(false);
  };

  const handleChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setDatePickerTarget(null);
      return;
    }

    if (!selectedDate || !datePickerTarget) return;
    applySelectedDate(datePickerTarget, selectedDate);
    if (Platform.OS !== 'ios') {
      setDatePickerTarget(null);
    }
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

  const handleSelectPeriod = (period: Exclude<PeriodFilter, 'custom' | null>) => {
    const range = getPeriodDateRange(period);

    setSelectedPeriod(period);
    setStartDate(range.start);
    setEndDate(range.end);
    setFilterErrorMessage('');
    setDatePickerTarget(null);
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
            <EmptyState
              title={
                hasLoadError
                  ? '결제내역을 불러오지 못했습니다.'
                  : '결제 내역이 없습니다.'
              }
              description={
                hasLoadError
                  ? '잠시 후 다시 시도해주세요.'
                  : undefined
              }
              actionLabel={hasLoadError ? '다시 시도' : undefined}
              onPressAction={hasLoadError ? loadPayments : undefined}
            />
          )}
        </View>
      </PageWrap>

      <FloatingButton
        value="my"
        onChange={(value) => {
          if (value === 'home') navigation.navigate('Main');
          if (value === 'payment') navigation.navigate('QrScan');
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
                onPress={() => handleSelectPeriod('week')}
              />
              <FilterChip
                label="이번 달"
                active={selectedPeriod === 'month'}
                onPress={() => handleSelectPeriod('month')}
              />
              <FilterChip
                label="올해"
                active={selectedPeriod === 'year'}
                onPress={() => handleSelectPeriod('year')}
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
            {filterErrorMessage ? (
              <Text className="mt-2 font-pretendard text-normal-regular text-state-error">
                {filterErrorMessage}
              </Text>
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
            size="large"
            onPress={handleApplyFilter}
          />

          {datePickerTarget && Platform.OS === 'ios' ? (
            <View className="absolute inset-x-0 bottom-0 z-10 rounded-2xl border border-neutral-grey1 bg-neutral-white p-4 shadow-sm">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="font-pretendard text-heading-3 text-neutral-black1">
                  {datePickerTarget === 'start' ? '시작일 선택' : '종료일 선택'}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  className="h-8 w-8 items-center justify-center rounded-full bg-neutral-grey3"
                  onPress={() => setDatePickerTarget(null)}
                >
                  <Feather name="x" size={18} color="#1D1F1F" />
                </Pressable>
              </View>
              <DateTimePicker
                value={datePickerTarget === 'start' ? startDate : endDate}
                mode="date"
                display="inline"
                themeVariant="light"
                textColor="#1D1F1F"
                accentColor="#2FAB84"
                onChange={handleChangeDate}
              />
              <View className="mt-3">
                <Button
                  label="선택 완료"
                  size="medium"
                  onPress={() => setDatePickerTarget(null)}
                />
              </View>
            </View>
          ) : null}
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
      <View className="flex-row gap-2">
        <Text className={`rounded px-2 py-1 font-pretendard text-normal-bold ${methodClassName[payment.method]}`}>
          {methodLabel[payment.method]}
        </Text>
        <Text className={`rounded px-2 py-1 font-pretendard text-normal-bold ${benefitClassName[payment.benefitType]}`}>
          {benefitLabel[payment.benefitType]}
        </Text>
      </View>
      <View className="mt-4 flex-row items-center justify-between gap-3">
        <Text
          numberOfLines={1}
          className="min-w-0 flex-1 font-pretendard text-large-bold text-neutral-black1"
        >
          {payment.title}
        </Text>
        <PaymentStatusBadge status={payment.status} />
      </View>
      <View className="mt-4 flex-row items-center justify-between gap-3">
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

function validateCustomDateRange(startDate: Date, endDate: Date) {
  const today = getTodayDate();

  if (startDate > endDate) {
    return '시작일은 종료일보다 늦을 수 없습니다.';
  }

  if (getYearDiffDate(startDate, MAX_CUSTOM_RANGE_YEARS) < endDate) {
    return `최대 ${MAX_CUSTOM_RANGE_YEARS}년 범위까지만 조회할 수 있습니다.`;
  }

  if (startDate > today || endDate > today) {
    return '오늘 이후 날짜는 선택할 수 없습니다.';
  }

  return '';
}

function getPeriodDateRange(period: Exclude<PeriodFilter, 'custom' | null>) {
  const today = getTodayDate();

  if (period === 'week') {
    const day = today.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const start = new Date(today);
    start.setDate(today.getDate() + mondayOffset);

    return { start, end: today };
  }

  if (period === 'month') {
    return {
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: today,
    };
  }

  return {
    start: new Date(today.getFullYear(), 0, 1),
    end: today,
  };
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

function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getTodayDate() {
  return normalizeDate(new Date());
}

function getYearDiffDate(date: Date, years: number) {
  return new Date(date.getFullYear() + years, date.getMonth(), date.getDate());
}

function getEarlierDate(firstDate: Date, secondDate: Date) {
  return firstDate < secondDate ? firstDate : secondDate;
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
