import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { BottomNav, MypageFrame, MypageHeader } from '../components/MypageLayout';

type CardManagementState = 'empty' | 'single' | 'multiple' | 'disabled';

interface CardManagementScreenProps {
  state?: CardManagementState;
  onBack?: () => void;
  onAddCard?: () => void;
  onPressCard?: () => void;
}

const cards = [
  {
    issuer: 'Shinhan',
    title: '신한카드 (1234)',
    name: 'Simple Plan+',
    alias: '별칭미설정',
    colorClassName: 'bg-blue-600',
    isDefault: true,
  },
  {
    issuer: 'Samsung',
    title: '삼성카드 (4444)',
    name: 'taptap O',
    alias: '탭탭탑탑탑',
    colorClassName: 'bg-indigo-600',
    isDefault: false,
  },
  {
    issuer: 'KB',
    title: '국민카드 (5893)',
    name: '노리',
    alias: '별칭미설정',
    colorClassName: 'bg-amber-700',
    isDefault: false,
    disabled: true,
  },
];

export function CardManagementScreen({
  state = 'empty',
  onBack,
  onAddCard,
  onPressCard,
}: CardManagementScreenProps) {
  const visibleCards =
    state === 'empty'
      ? []
      : state === 'single'
        ? cards.slice(0, 1)
        : state === 'disabled'
          ? [cards[2]]
          : cards;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <MypageFrame backgroundClassName="bg-white">
        <MypageHeader title="카드관리" onBack={onBack} />
        <ScrollView
          className="w-full flex-1"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-[360px] self-center px-4 pb-44 pt-4">
            {visibleCards.length === 0 ? (
              <View className="h-12 w-full items-center justify-center rounded-2xl border border-zinc-100 bg-white shadow-sm">
                <Text className="text-sm text-slate-500">
                  등록된 카드가 없습니다.
                </Text>
              </View>
            ) : (
              <View className="w-full gap-3">
                {visibleCards.map((card) => (
                  <CardListItem
                    key={card.title}
                    {...card}
                    onPress={onPressCard}
                  />
                ))}
              </View>
            )}

            <Pressable
              accessibilityRole="button"
              className="mt-3 h-20 w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white"
              onPress={onAddCard}
            >
              <View className="h-8 w-8 items-center justify-center rounded-full bg-blue-700">
                <Text className="text-2xl leading-7 text-white">+</Text>
              </View>
              <Text className="mt-2 text-base font-bold text-slate-950">
                카드 추가하기
              </Text>
            </Pressable>

            <View className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4">
              <Text className="text-sm leading-6 text-blue-900">
                💳 등록된 카드는 결제 시 선택하여 사용할 수 있습니다.
              </Text>
              <Text className="text-sm leading-6 text-blue-900">
                대표 카드는 자동으로 우선 선택됩니다.
              </Text>
            </View>
          </View>
        </ScrollView>
        <BottomNav active="pay" />
      </MypageFrame>
    </SafeAreaView>
  );
}

function CardListItem({
  issuer,
  title,
  name,
  alias,
  colorClassName,
  isDefault,
  disabled = false,
  onPress,
}: {
  issuer: string;
  title: string;
  name: string;
  alias: string;
  colorClassName: string;
  isDefault: boolean;
  disabled?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`h-[82px] w-full flex-row items-center rounded-2xl border border-zinc-100 bg-white px-4 shadow-sm ${
        disabled ? 'opacity-50' : ''
      }`}
      onPress={onPress}
    >
      <View
        className={`mr-3 h-12 w-20 rounded-lg px-2 py-2 ${colorClassName}`}
      >
        <Text className="text-[10px] text-white">{issuer}</Text>
        <Text className="mt-2 text-xs font-bold tracking-widest text-white">
          ••••
        </Text>
      </View>
      <View className="flex-1">
        <View className="flex-row items-center">
          {isDefault ? (
            <Text className="mr-2 rounded px-1.5 py-0.5 text-xs font-bold text-white bg-emerald-400">
              대표
            </Text>
          ) : null}
          {disabled ? (
            <Text className="mr-2 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
              사용불가
            </Text>
          ) : null}
          <Text className="text-base font-bold text-slate-950">{title}</Text>
        </View>
        <Text className="mt-1 text-sm text-slate-950">{name}</Text>
        <Text className="mt-1 text-xs text-slate-500">{alias}</Text>
      </View>
      <Text className="text-3xl font-light text-slate-400">›</Text>
    </Pressable>
  );
}

export default CardManagementScreen;
