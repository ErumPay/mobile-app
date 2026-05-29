import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../../App';
import { BottomNav, MypageFrame, MypageHeader } from '../components/MypageLayout';

interface PaymentHistoryScreenProps {
  isEmpty?: boolean;
  showFilterSheet?: boolean;
  onBack?: () => void;
  onPressFilter?: () => void;
  onPressItem?: () => void;
  onCloseFilter?: () => void;
}

type PaymentTab = 'all' | 'completed' | 'canceled';

type PaymentStatus = '결제완료' | '결제취소' | '결제취소요청';

interface PaymentHistoryItem {
  id: string;
  method: string;
  status: PaymentStatus;
  title: string;
  date: string;
  amount: string;
  tone: string;
}

const mockPayments: PaymentHistoryItem[] = [
  {
    id: 'payment-1',
    method: '더치페이',
    status: '결제완료',
    title: 'Luxury Hotel Stay',
    date: '2026.04.23',
    amount: '34,000원',
    tone: 'pink',
  },
  {
    id: 'payment-2',
    method: '원격결제',
    status: '결제취소요청',
    title: '코드보안 양성산',
    date: '2026.04.18',
    amount: '34,000원',
    tone: 'purple',
  },
  {
    id: 'payment-3',
    method: '단일혜택',
    status: '결제취소',
    title: '서울순대국',
    date: '2026.04.16',
    amount: '8,000원',
    tone: 'blue',
  },
  {
    id: 'payment-4',
    method: '단일실적',
    status: '결제완료',
    title: '스타벅스 코리아 양성점',
    date: '2026.04.05',
    amount: '18,300원',
    tone: 'cyan',
  },
  {
    id: 'payment-5',
    method: '분할혜택',
    status: '결제취소',
    title: '유니클로 양동포점',
    date: '2026.04.02',
    amount: '52,900원',
    tone: 'emerald',
  },
  {
    id: 'payment-6',
    method: '분할실적',
    status: '결제완료',
    title: '무인양품 첨단센타운',
    date: '2026.04.01',
    amount: '3,334,000원',
    tone: 'lime',
  },
];

export function PaymentHistoryScreen({
  isEmpty = false,
  showFilterSheet = false,
  onBack,
  onPressFilter,
  onPressItem,
  onCloseFilter,
}: PaymentHistoryScreenProps) {
  const [activeTab, setActiveTab] = useState<PaymentTab>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handlePressPayment = (payment: PaymentHistoryItem) => {
    navigation.navigate('PaymentDetailScreen', {
      paymentId: payment.id,
    });
  };

  const sourcePayments = isEmpty ? [] : mockPayments;

  const filteredPayments = sourcePayments.filter((payment) => {
    if (activeTab === 'all') {
      return true;
    }

    if (activeTab === 'completed') {
      return payment.status === '결제완료';
    }

    return payment.status === '결제취소' || payment.status === '결제취소요청';
  });

  const hasPayments = filteredPayments.length > 0;
  const isFilterSheetVisible = showFilterSheet || isFilterOpen;

  const handlePressFilter = () => {
    setIsFilterOpen(true);
    onPressFilter?.();
  };

  const handleCloseFilter = () => {
    setIsFilterOpen(false);
    onCloseFilter?.();
  };

  return (
      <MypageFrame backgroundClassName="bg-zinc-50">
        <MypageHeader title="결제내역" onBack={onBack} />
        <View className="h-12 w-full flex-row border-b border-zinc-100 bg-white">
          <HistoryTab
            label="전체"
            active={activeTab === 'all'}
            onPress={() => setActiveTab('all')}
          />
          <HistoryTab
            label="결제완료"
            active={activeTab === 'completed'}
            onPress={() => setActiveTab('completed')}
          />
          <HistoryTab
            label="결제취소"
            active={activeTab === 'canceled'}
            onPress={() => setActiveTab('canceled')}
          />
        </View>

        <ScrollView
          className="w-full flex-1"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-[360px] flex-1 self-center px-4 pb-44 pt-6">
            <View className="mb-4 w-full flex-row items-center justify-between">
              <Text className="text-base font-bold text-slate-950">
                총 {filteredPayments.length}건
              </Text>
              <Pressable
                accessibilityRole="button"
                className="h-8 w-8 items-center justify-center rounded-full bg-blue-800"
                onPress={handlePressFilter}
              >
                <Text className="text-lg text-white">▽</Text>
              </Pressable>
            </View>

            {hasPayments ? (
              <View className="w-full gap-4">
                {filteredPayments.map((payment) => (
                  <PaymentItem
                    key={payment.id}
                    method={payment.method}
                    status={payment.status}
                    title={payment.title}
                    date={payment.date}
                    amount={payment.amount}
                    tone={payment.tone}
                    onPress={() => handlePressPayment(payment)}
                  />
                ))}
              </View>
            ) : (
              <View className="h-12 w-full items-center justify-center rounded-2xl border border-zinc-100 bg-white shadow-sm">
                <Text className="text-sm text-slate-500">
                  결제 내역이 없습니다.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        <BottomNav active="pay" />
        {isFilterSheetVisible ? (
          <FilterSheet onClose={handleCloseFilter} />
        ) : null}
      </MypageFrame>
  );
}

function HistoryTab({
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
      className="flex-1"
      onPress={onPress}
    >
      <View className="h-[46px] items-center justify-center">
        <Text
          className={`text-sm font-semibold ${
            active ? 'text-blue-800' : 'text-slate-500'
          }`}
        >
          {label}
        </Text>
      </View>
      <View
        className={`h-0.5 w-full ${
          active ? 'bg-blue-800' : 'bg-transparent'
        }`}
      />
    </Pressable>
  );
}

function PaymentItem({
  method,
  status,
  title,
  date,
  amount,
  tone,
  onPress,
}: {
  method: string;
  status: string;
  title: string;
  date: string;
  amount: string;
  tone: string;
  onPress?: () => void;
}) {
  const toneClassName: Record<string, string> = {
    pink: 'bg-pink-50 text-pink-600',
    purple: 'bg-purple-50 text-purple-600',
    blue: 'bg-blue-50 text-blue-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    lime: 'bg-lime-50 text-lime-700',
  };

  return (
    <Pressable
      accessibilityRole="button"
      className="w-full rounded-2xl border border-zinc-100 bg-white px-4 py-4 shadow-sm"
      onPress={onPress}
    >
      <View className="w-full flex-row items-center">
        <Text className={`rounded-md px-2 py-1 text-xs font-bold ${toneClassName[tone]}`}>
          {method}
        </Text>
        <Text className="ml-3 text-xs text-slate-500">{status}</Text>
      </View>
      <Text className="mt-4 text-base font-bold text-slate-950">{title}</Text>
      <View className="mt-4 h-px w-full bg-zinc-100" />
      <View className="mt-4 w-full flex-row items-center justify-between">
        <Text className="text-sm text-slate-500">{date}</Text>
        <Text className="text-xl font-bold text-slate-950">{amount}</Text>
      </View>
    </Pressable>
  );
}

function FilterSheet({ onClose }: { onClose?: () => void }) {
  return (
    <View className="absolute inset-0 justify-end bg-black/45">
      <View className="w-full rounded-t-2xl bg-white px-4 pb-6 pt-4">
        <View className="mb-8 w-full flex-row items-center justify-between">
          <Text className="text-lg font-bold text-slate-950">필터</Text>
          <Pressable
            accessibilityRole="button"
            className="h-8 w-8 items-end"
            onPress={onClose}
          >
            <Text className="text-3xl font-light leading-8 text-slate-950">×</Text>
          </Pressable>
        </View>

        <Text className="mb-3 text-base font-bold text-slate-950">기간</Text>
        <View className="mb-5 w-full flex-row">
          <FilterChip label="이번주" active />
          <View className="w-2" />
          <FilterChip label="이번달" />
          <View className="w-2" />
          <FilterChip label="올해" />
        </View>

        <Text className="mb-3 text-base font-bold text-slate-950">기간 선택</Text>
        <View className="mb-5 w-full flex-row">
          <DateBox label="2026.04.30" />
          <View className="w-2" />
          <DateBox label="2026.05.01" />
        </View>

        <Text className="mb-3 text-base font-bold text-slate-950">결제수단</Text>
        <View className="mb-5 w-full flex-row flex-wrap">
          {['더치페이', '원격결제', '단일혜택', '단일실적', '분할혜택', '분할실적'].map(
            (label) => (
              <View key={label} className="mb-2 w-1/3 px-1">
                <FilterChip label={label} active={label === '원격결제'} />
              </View>
            ),
          )}
        </View>

        <Pressable
          accessibilityRole="button"
          className="h-12 w-full items-center justify-center rounded-xl bg-blue-800"
        >
          <Text className="text-base font-bold text-white">결과보기</Text>
        </Pressable>
      </View>
    </View>
  );
}

function DateBox({ label }: { label: string }) {
  return (
    <View className="h-12 flex-1 justify-center rounded-lg border border-zinc-200 bg-white px-4">
      <Text className="text-base text-slate-950">{label}</Text>
    </View>
  );
}

function FilterChip({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <View className={`h-10 w-full items-center justify-center rounded-full ${active ? 'bg-blue-800' : 'bg-zinc-100'}`}>
      <Text className={`text-sm font-bold ${active ? 'text-white' : 'text-slate-600'}`}>
        {label}
      </Text>
    </View>
  );
}

export default PaymentHistoryScreen;
