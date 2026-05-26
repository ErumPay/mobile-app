import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { BottomNav, MypageFrame, MypageHeader } from '../components/MypageLayout';

interface PaymentHistoryScreenProps {
  isEmpty?: boolean;
  showFilterSheet?: boolean;
  onBack?: () => void;
  onPressFilter?: () => void;
  onPressItem?: () => void;
  onCloseFilter?: () => void;
}

const payments = [
  {
    method: '더치페이',
    status: '결제완료',
    title: 'Luxury Hotel Stay',
    date: '2026.04.23',
    amount: '34,000원',
    tone: 'pink',
  },
  {
    method: '원격결제',
    status: '결제취소요청',
    title: '코드보안 양성산',
    date: '2026.04.18',
    amount: '34,000원',
    tone: 'purple',
  },
  {
    method: '단일혜택',
    status: '결제취소',
    title: '서울순대국',
    date: '2026.04.16',
    amount: '8,000원',
    tone: 'blue',
  },
  {
    method: '단일실적',
    status: '결제완료',
    title: '스타벅스 코리아 양성점',
    date: '2026.04.05',
    amount: '18,300원',
    tone: 'cyan',
  },
  {
    method: '분할혜택',
    status: '결제취소',
    title: '유니클로 양동포점',
    date: '2026.04.02',
    amount: '52,900원',
    tone: 'emerald',
  },
  {
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
  return (
    <SafeAreaView className="flex-1 bg-zinc-50">
      <MypageFrame>
        <MypageHeader title="결제내역" onBack={onBack} />
        <View className="h-12 flex-row border-b border-zinc-100 bg-white">
          <Tab label="전체" active />
          <Tab label="결제완료" />
          <Tab label="결제취소" />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-36 pt-4"
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-base font-bold text-slate-950">
              총 {isEmpty ? 0 : 7}건
            </Text>
            <Pressable
              accessibilityRole="button"
              className="h-8 w-8 items-center justify-center rounded-full bg-blue-800"
              onPress={onPressFilter}
            >
              <Text className="text-lg text-white">▽</Text>
            </Pressable>
          </View>

          {isEmpty ? (
            <View className="h-12 items-center justify-center rounded-xl bg-white shadow-sm">
              <Text className="text-sm text-slate-500">결제 내역이 없습니다.</Text>
            </View>
          ) : (
            <View className="gap-4">
              {payments.map((payment) => (
                <PaymentItem
                  key={`${payment.title}-${payment.date}`}
                  {...payment}
                  onPress={onPressItem}
                />
              ))}
            </View>
          )}
        </ScrollView>

        <BottomNav active="pay" />
        {showFilterSheet ? <FilterSheet onClose={onCloseFilter} /> : null}
      </MypageFrame>
    </SafeAreaView>
  );
}

function Tab({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <View className="flex-1 items-center justify-end">
      <Text className={`pb-3 text-sm font-semibold ${active ? 'text-blue-800' : 'text-slate-500'}`}>
        {label}
      </Text>
      <View className={`h-0.5 w-full ${active ? 'bg-blue-800' : 'bg-transparent'}`} />
    </View>
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
      className="rounded-xl bg-white px-4 py-4 shadow-sm"
      onPress={onPress}
    >
      <View className="flex-row items-center">
        <Text className={`rounded-md px-2 py-1 text-xs font-bold ${toneClassName[tone]}`}>
          {method}
        </Text>
        <Text className="ml-3 text-xs text-slate-500">{status}</Text>
      </View>
      <Text className="mt-4 text-base font-bold text-slate-950">{title}</Text>
      <View className="mt-4 h-px bg-zinc-100" />
      <View className="mt-4 flex-row items-center justify-between">
        <Text className="text-sm text-slate-500">{date}</Text>
        <Text className="text-xl font-bold text-slate-950">{amount}</Text>
      </View>
    </Pressable>
  );
}

function FilterSheet({ onClose }: { onClose?: () => void }) {
  return (
    <View className="absolute inset-0 justify-end bg-black/40">
      <View className="rounded-t-2xl bg-white px-4 pb-6 pt-4">
        <View className="mb-8 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-slate-950">필터</Text>
          <Pressable
            accessibilityRole="button"
            className="h-8 w-8 items-center justify-center"
            onPress={onClose}
          >
            <Text className="text-3xl font-light leading-8 text-slate-950">×</Text>
          </Pressable>
        </View>

        <Text className="mb-3 text-base font-bold text-slate-950">기간</Text>
        <View className="mb-5 flex-row gap-2">
          <FilterChip label="이번주" active />
          <FilterChip label="이번달" />
          <FilterChip label="올해" />
        </View>

        <Text className="mb-3 text-base font-bold text-slate-950">기간 선택</Text>
        <View className="mb-5 flex-row gap-2">
          <View className="h-12 flex-1 justify-center rounded-lg border border-zinc-200 px-4">
            <Text className="text-base text-slate-950">2026.04.30</Text>
          </View>
          <View className="h-12 flex-1 justify-center rounded-lg border border-zinc-200 px-4">
            <Text className="text-base text-slate-950">2026.05.01</Text>
          </View>
        </View>

        <Text className="mb-3 text-base font-bold text-slate-950">결제수단</Text>
        <View className="mb-5 flex-row flex-wrap gap-2">
          {['더치페이', '원격결제', '단일혜택', '단일실적', '분할혜택', '분할실적'].map(
            (label) => (
              <FilterChip key={label} label={label} active={label === '원격결제'} />
            ),
          )}
        </View>

        <Pressable
          accessibilityRole="button"
          className="h-12 w-full items-center justify-center rounded-lg bg-blue-800"
        >
          <Text className="text-base font-bold text-white">결과보기</Text>
        </Pressable>
      </View>
    </View>
  );
}

function FilterChip({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <View className={`h-10 min-w-[102px] flex-1 items-center justify-center rounded-full ${active ? 'bg-blue-800' : 'bg-zinc-100'}`}>
      <Text className={`text-sm font-bold ${active ? 'text-white' : 'text-slate-600'}`}>
        {label}
      </Text>
    </View>
  );
}

export default PaymentHistoryScreen;
