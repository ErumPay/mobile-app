import { Pressable, ScrollView, Text, View } from 'react-native';

import {
  BottomNav,
  CardSection,
  Divider,
  InfoRow,
  MypageFrame,
  MypageHeader,
} from '../components/MypageLayout';

import { useState } from 'react';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../../../App';

interface CardDetailScreenProps {
  route: RouteProp<RootStackParamList, 'CardDetailScreen'>;
  onBack?: () => void;
  onSetDefault?: () => void;
  onEditAlias?: () => void;
  onDelete?: () => void;
}

type MockCardDetail = {
  issuer: string;
  cardName: string;
  cardNumber: string;
  registeredAt: string;
  isDefault: boolean;
  disabled: boolean;
  hasPayments: boolean;
};

const mockCardDetails: Record<string, MockCardDetail> = {
  'card-1': {
    issuer: 'Nany',
    cardName: 'Nany My 카드',
    cardNumber: '3424 **** **** 1234',
    registeredAt: '2026.03.15',
    isDefault: true,
    disabled: false,
    hasPayments: false,
  },
  'card-2': {
    issuer: 'Nany',
    cardName: 'Nany My 카드',
    cardNumber: '3424 **** **** 1234',
    registeredAt: '2026.03.15',
    isDefault: false,
    disabled: false,
    hasPayments: true,
  },
  'card-3': {
    issuer: 'Nany',
    cardName: 'Nany My 카드',
    cardNumber: '3424 **** **** 1234',
    registeredAt: '2026.03.15',
    isDefault: false,
    disabled: true,
    hasPayments: false,
  },
};

const benefitRows = [
  '해외 승/오프라인 적립',
  'N트래블플러스 할그레이드',
  '네이버 쇼핑 스마트/브랜드 스어어 건별결제 적립',
  '네이버페이 서비스 기본 적립',
  '국내 승/오프라인 가맹결제 적립',
  '네이버 플러스 멤버십 스마트 정기결제 적립',
  '네이버페이 추가 적립 (플러스 멤버십)',
  '플러스 멤버십 무료 콘텐츠',
  '플러스 멤버십 MYBOX 자동결제',
];

export function CardDetailScreen({
  route,
  onBack,
  onSetDefault,
  onEditAlias,
  onDelete,
}: CardDetailScreenProps) {
  const [openBenefitIndex, setOpenBenefitIndex] = useState<number | null>(null);

  const cardId = route.params.cardId;
  const card = mockCardDetails[cardId] ?? mockCardDetails['card-1'];

  const isDisabled = card.disabled;
  const hasPayments = card.hasPayments;
  return (
      <MypageFrame backgroundClassName="bg-white">
        <MypageHeader title="카드 상세" onBack={onBack} />
        <ScrollView
          className="w-full flex-1"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-[360px] self-center px-4 pb-44 pt-4">
            {isDisabled ? (
              <View className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                <Text className="text-sm font-bold text-red-600">
                  사용 정지된 카드입니다.
                </Text>
              </View>
            ) : null}

            <CardSection>
              <Text className="mb-4 text-lg font-bold text-slate-950">
                카드 정보
              </Text>
              <View className="w-full flex-row items-center justify-between py-2">
                <Text className="text-base text-slate-500">카드사</Text>
                <View className="flex-row items-center">
                  {card.isDefault ? (
                    <Text className="mr-2 rounded bg-emerald-400 px-2 py-0.5 text-xs font-bold text-white">
                      대표
                    </Text>
                  ) : null}
                  <Text className="text-base font-bold text-slate-950">
                    {card.issuer}
                  </Text>
                </View>
              </View>
              <InfoRow label="카드명" value={card.cardName} />
              <InfoRow label="카드번호" value={card.cardNumber} />
              <InfoRow label="등록일" value={card.registeredAt} />
            </CardSection>

            <View className="mt-5">
              <CardSection>
                <Text className="mb-4 text-lg font-bold text-slate-950">
                  이번 달 실적
                </Text>
                <InfoRow
                  label="사용금액"
                  value="245,000원"
                  valueClassName="text-blue-800"
                />
                <InfoRow
                  label="할인받은 금액"
                  value="12,250원"
                  valueClassName="text-emerald-400"
                />
                <View className="mt-4 flex-row items-center justify-between">
                  <Text className="text-sm text-slate-500">실적 달성률</Text>
                  <Text className="text-sm text-slate-500">300,000원</Text>
                </View>
                <View className="mt-3 h-2 w-full rounded-full bg-zinc-200">
                  <View className="h-2 w-[84%] rounded-full bg-blue-800" />
                </View>
              </CardSection>
            </View>

            <View className="mt-5 rounded-2xl border border-zinc-100 bg-white px-4 py-4 shadow-sm">
              <View className="w-full flex-row items-center justify-between">
                <Text className="text-lg font-bold text-slate-950">연회비</Text>
                <Text className="text-base text-slate-950">면제</Text>
              </View>
            </View>

            <View className="mt-5">
              <CardSection>
                <View className="mb-3 w-full flex-row items-center justify-between">
                  <Text className="text-lg font-bold text-slate-950">혜택</Text>
                  <Text className="rounded-full bg-blue-800 px-4 py-2 text-sm font-bold text-white">
                    조건 없음
                  </Text>
                </View>
                {benefitRows.map((row, index) => (
                  <BenefitRow
                    key={row}
                    title={row}
                    open={openBenefitIndex === index}
                    onPress={() =>
                      setOpenBenefitIndex((currentIndex) =>
                        currentIndex === index ? null : index
                      )
                    }
                  />
                ))}
              </CardSection>
            </View>

            <View className="mt-5 overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
              <View className="h-12 w-full flex-row">
                <Tab label="전체" active />
                <Tab label="결제완료" />
                <Tab label="결제취소" />
              </View>
              <Divider />
              {hasPayments ? (
                <View className="px-4 py-3">
                  <PaymentMiniRow title="스타벅스 강남점" status="결제완료" date="2026.05.10" amount="5,500원" />
                  <PaymentMiniRow title="GS25 편의점" status="결제취소요청" date="2026.05.09" amount="-12,000원" muted />
                  <PaymentMiniRow title="교보문고" status="결제취소" date="2026.05.08" amount="-28,000원" muted />
                  <PaymentMiniRow title="올리브영" status="결제완료" date="2026.05.07" amount="34,500원" />
                </View>
              ) : (
                <View className="h-14 items-center justify-center">
                  <Text className="text-sm text-slate-500">
                    결제 내역이 없습니다.
                  </Text>
                </View>
              )}
            </View>

            <View className="mt-6 gap-3">
              <ActionButton icon="☆" title="대표 카드로 설정" onPress={onSetDefault} />
              <ActionButton icon="✎" title="카드 별칭 수정" onPress={onEditAlias} />
              <ActionButton
                icon="♲"
                title="카드 삭제하기"
                danger
                onPress={onDelete}
              />
            </View>

            <View className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-4">
              <Text className="text-sm leading-5 text-red-600">
                ▲ 카드를 삭제하면 모든 결제 내역은 유지되지만,{'\n'}
                해당 카드로는 더 이상 결제할 수 없습니다.
              </Text>
            </View>
          </View>
        </ScrollView>
        <BottomNav active="pay" />
      </MypageFrame>
  );
}

function BenefitRow({
  title,
  open,
  onPress,
}: {
  title: string;
  open: boolean;
  onPress: () => void;
}) {
  return (
    <View className="w-full py-2">
      <Pressable
        accessibilityRole="button"
        className="w-full flex-row items-center justify-between"
        onPress={onPress}
      >
        <Text className="flex-1 text-base font-semibold text-slate-950">
          {title}
        </Text>
        <Text className="text-xl text-slate-400">{open ? '⌃' : '⌄'}</Text>
      </Pressable>
      {open ? (
        <Text className="mt-2 text-sm leading-5 text-slate-700">
          해외 승/오프라인 적립에 대한 내용입니다. 해외 승/오프라인 적립에
          대한 내용입니다.{'\n'}• 타이틀{'\n'}  • 콘텐츠1{'\n'}  • 콘텐츠1
        </Text>
      ) : null}
    </View>
  );
}

function Tab({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <View className="flex-1">
      <View className="h-[46px] items-center justify-center">
        <Text
          className={`text-sm font-semibold ${
            active ? 'text-blue-800' : 'text-slate-500'
          }`}
        >
          {label}
        </Text>
      </View>
      <View className={`h-0.5 w-full ${active ? 'bg-blue-800' : 'bg-transparent'}`} />
    </View>
  );
}

function PaymentMiniRow({
  title,
  status,
  date,
  amount,
  muted,
}: {
  title: string;
  status: string;
  date: string;
  amount: string;
  muted?: boolean;
}) {
  return (
    <View className="w-full flex-row items-end justify-between py-2">
      <View>
        <View className="flex-row items-center">
          <Text className="text-base font-bold text-slate-950">{title}</Text>
          <Text className="ml-2 text-xs text-slate-400">{status}</Text>
        </View>
        <Text className="mt-1 text-sm text-slate-500">{date}</Text>
      </View>
      <Text className={`text-base font-bold ${muted ? 'text-slate-400' : 'text-slate-950'}`}>
        {amount}
      </Text>
    </View>
  );
}

function ActionButton({
  icon,
  title,
  danger,
  onPress,
}: {
  icon: string;
  title: string;
  danger?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`h-14 w-full flex-row items-center justify-center rounded-xl border bg-white ${
        danger ? 'border-red-500' : 'border-slate-300'
      }`}
      onPress={onPress}
    >
      <Text className={`mr-2 text-xl ${danger ? 'text-red-500' : 'text-slate-950'}`}>
        {icon}
      </Text>
      <Text className={`text-lg font-bold ${danger ? 'text-red-500' : 'text-slate-950'}`}>
        {title}
      </Text>
    </Pressable>
  );
}

export default CardDetailScreen;
