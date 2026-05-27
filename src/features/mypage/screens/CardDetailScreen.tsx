import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

import {
  BottomNav,
  CardSection,
  Divider,
  InfoRow,
  MypageFrame,
  MypageHeader,
} from '../components/MypageLayout';

interface CardDetailScreenProps {
  isDisabled?: boolean;
  hasPayments?: boolean;
  benefitOpen?: boolean;
  onBack?: () => void;
  onSetDefault?: () => void;
  onEditAlias?: () => void;
  onDelete?: () => void;
}

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
  isDisabled = false,
  hasPayments = false,
  benefitOpen = false,
  onBack,
  onSetDefault,
  onEditAlias,
  onDelete,
}: CardDetailScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <MypageFrame backgroundClassName="bg-white">
        <MypageHeader title="카드 상세" onBack={onBack} />
        <ScrollView
          className="w-full flex-1"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full px-4 pb-36 pt-4">
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
              <InfoRow label="카드사" value="Nany" />
              <InfoRow label="카드명" value="Nany My 카드" />
              <InfoRow label="카드번호" value="3424 **** **** 1234" />
              <InfoRow label="등록일" value="2026.03.15" />
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
                    open={benefitOpen && index === 0}
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
    </SafeAreaView>
  );
}

function BenefitRow({ title, open }: { title: string; open: boolean }) {
  return (
    <View className="w-full py-2">
      <View className="w-full flex-row items-center justify-between">
        <Text className="flex-1 text-base font-semibold text-slate-950">
          {title}
        </Text>
        <Text className="text-xl text-slate-400">{open ? '⌃' : '⌄'}</Text>
      </View>
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
