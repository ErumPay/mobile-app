import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Modal as RNModal, Pressable, Text, TextInput, View } from 'react-native';

import type { RootStackParamList } from '../../../../App';
import { Accordion } from '../../../shared/components/Accordion';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { EmptyState } from '../../../shared/components/EmptyState';
import { FloatingButton } from '../../../shared/components/FloatingButton';
import { Header } from '../../../shared/components/Header';
import { Modal } from '../../../shared/components/Modal';
import { NoticeBox } from '../../../shared/components/NoticeBox';
import { PageWrap } from '../../../shared/components/PageWrap';
import { SkeletonCard } from '../../../shared/components/Skeleton';
import { Tab } from '../../../shared/components/Tab';
import {
  deleteManagedCard,
  fetchManagedCards,
  fetchCardBenefits,
  fetchCardPerformance,
  fetchPaymentHistoriesByCard,
  setManagedDefaultCard,
  updateManagedCardAlias,
} from '../api/mypageApi';
import { PaymentStatusBadge } from '../components/PaymentStatusBadge';
import { useManagedCardsStore } from '../stores/useManagedCardsStore';
import type {
  CardBenefit,
  CardPerformance,
  PaymentHistoryItem,
  PaymentStatus,
} from '../types/mypage';

type Props = NativeStackScreenProps<RootStackParamList, 'CardDetailScreen'>;
type PaymentDetailTab = 'all' | 'completed' | 'canceled';

const paymentHistoryTabs = [
  { label: '전체', value: 'all' },
  { label: '결제완료', value: 'completed' },
  { label: '결제취소', value: 'canceled' },
] satisfies { label: string; value: PaymentDetailTab }[];

export function CardDetailScreen({ navigation, route }: Props) {
  const [dialog, setDialog] = useState<
    | 'default'
    | 'defaultComplete'
    | 'alias'
    | 'aliasComplete'
    | 'delete'
    | 'deleteComplete'
    | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [activePaymentTab, setActivePaymentTab] =
    useState<PaymentDetailTab>('all');
  const [expandedBenefitIndex, setExpandedBenefitIndex] = useState<
    number | null
  >(null);
  const [aliasValue, setAliasValue] = useState('');
  const [cardBenefits, setCardBenefits] = useState<CardBenefit[]>([]);
  const [cardPerformance, setCardPerformance] =
    useState<CardPerformance | null>(null);
  const [cardPayments, setCardPayments] = useState<PaymentHistoryItem[]>([]);
  const [isResolvingCard, setIsResolvingCard] = useState(false);
  const [hasCardLookupFailed, setHasCardLookupFailed] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const cards = useManagedCardsStore((state) => state.cards);
  const setCards = useManagedCardsStore((state) => state.setCards);
  const setDefaultCard = useManagedCardsStore((state) => state.setDefaultCard);
  const deleteCard = useManagedCardsStore((state) => state.deleteCard);
  const updateCardAlias = useManagedCardsStore((state) => state.updateCardAlias);
  const card = cards.find((item) => item.id === route.params.cardId);

  useEffect(() => {
    if (card) {
      setHasCardLookupFailed(false);
      return;
    }

    let isActive = true;

    setIsResolvingCard(true);
    setHasCardLookupFailed(false);
    fetchManagedCards()
      .then((nextCards) => {
        if (!isActive) return;

        setCards(nextCards);
        setHasCardLookupFailed(
          !nextCards.some((item) => item.id === route.params.cardId),
        );
      })
      .catch((error) => {
        console.warn('Failed to resolve card detail.', error);
        if (isActive) {
          setHasCardLookupFailed(true);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsResolvingCard(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [card, route.params.cardId, setCards]);

  useEffect(() => {
    if (card) {
      setAliasValue(card.alias);
    }
  }, [card?.alias]);

  useEffect(() => {
    if (!card) {
      return;
    }

    let isActive = true;
    setIsLoading(true);
    setHasLoadError(false);

    Promise.allSettled([
      fetchCardBenefits(card.id),
      fetchPaymentHistoriesByCard(card.id),
      fetchCardPerformance(card.id),
    ])
      .then(([benefitsResult, paymentsResult, performanceResult]) => {
        if (!isActive) {
          return;
        }

        setCardBenefits(
          benefitsResult.status === 'fulfilled' ? benefitsResult.value : [],
        );
        setCardPayments(
          paymentsResult.status === 'fulfilled' ? paymentsResult.value : [],
        );
        setCardPerformance(
          performanceResult.status === 'fulfilled'
            ? performanceResult.value
            : null,
        );
      })
      .catch((error) => {
        console.warn('Failed to fetch card details.', error);
        if (isActive) {
          setCardBenefits([]);
          setCardPayments([]);
          setCardPerformance(null);
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
  }, [card?.id]);

  if (!card) {
    return (
      <PageWrap
        backgroundClassName="bg-neutral-white"
        header={
          <Header
            title="카드 상세"
            type="back"
            onPressLeft={() => navigation.navigate('CardManagementScreen')}
          />
        }
      >
        {isResolvingCard ? (
          <View className="gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : (
          <EmptyState
            title={
              hasCardLookupFailed
                ? '카드 정보를 불러오지 못했습니다.'
                : '카드 정보를 찾을 수 없습니다.'
            }
          />
        )}
      </PageWrap>
    );
  }

  const filteredCardPayments = cardPayments.filter((payment) => {
    if (activePaymentTab === 'all') return true;
    if (activePaymentTab === 'completed') return payment.status === 'completed';
    return payment.status === 'canceled' || payment.status === 'cancelRequested';
  });
  const performanceTarget =
    cardPerformance?.targetAmount ??
    resolvePerformanceTarget(cardPerformance?.amount ?? 0, cardBenefits);

  return (
    <>
      <PageWrap
        backgroundClassName="bg-neutral-white"
        header={
          <Header
            title="카드 상세"
            type="back"
            onPressLeft={() => navigation.goBack()}
          />
        }
      >
        <View className="gap-5 pb-28">
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : hasLoadError ? (
            <EmptyState title="카드 상세 정보를 불러오지 못했습니다." />
          ) : (
            <>
              {card.disabled ? (
                <NoticeBox tone="error" description="사용 정지 카드입니다." />
              ) : null}

              <Card title="카드 정보">
                <InfoRow
                  label="카드사"
                  value={card.issuer}
                  badge={card.isDefault ? '대표' : undefined}
                />
                <InfoRow label="카드명" value={card.name} />
                <InfoRow label="카드번호" value={card.cardNumber} />
                <InfoRow label="등록일" value={card.registeredAt || '-'} />
              </Card>

              <MonthlyPerformanceCard
                performance={cardPerformance}
                targetAmount={performanceTarget}
              />

              <Card title="혜택">
                <View className="gap-2">
                  {cardBenefits.length > 0 ? (
                    cardBenefits.map((benefit, index) => (
                      <Accordion
                        key={`${benefit.title}-${index}`}
                        title={benefit.title}
                        expanded={expandedBenefitIndex === index}
                        onToggle={() =>
                          setExpandedBenefitIndex((currentIndex) =>
                            currentIndex === index ? null : index,
                          )
                        }
                      >
                        <Text className="font-pretendard text-large-regular text-neutral-black2">
                          {benefit.description}
                        </Text>
                      </Accordion>
                    ))
                  ) : (
                    <Text className="py-4 text-center font-pretendard text-large-regular text-neutral-black2">
                      등록된 혜택이 없습니다.
                    </Text>
                  )}
                </View>
              </Card>

              <Card>
                <View className="mb-3">
                  <Tab
                    items={paymentHistoryTabs}
                    value={activePaymentTab}
                    onChange={(value) => setActivePaymentTab(value as PaymentDetailTab)}
                  />
                </View>

                {filteredCardPayments.length > 0 ? (
                  filteredCardPayments.map((payment, index) => (
                    <View key={payment.id}>
                      {index > 0 ? <Divider /> : null}
                      <PaymentMiniRow
                        title={payment.title}
                        statusType={payment.status}
                        date={payment.date}
                        amount={payment.amount}
                      />
                    </View>
                  ))
                ) : (
                  <Text className="py-4 text-center font-pretendard text-large-regular text-neutral-black2">
                    결제 내역이 없습니다.
                  </Text>
                )}
              </Card>

              <View className="gap-3">
                {!card.isDefault && !card.disabled ? (
                  <Button
                    label="대표카드로 설정"
                    onPress={() => setDialog('default')}
                  />
                ) : null}
                <Button
                  label="카드 별칭 수정"
                  variant="secondary"
                  onPress={() => {
                    setAliasValue(card.alias);
                    setDialog('alias');
                  }}
                />
                <Button
                  label="카드 삭제하기"
                  variant="danger"
                  onPress={() => setDialog('delete')}
                />
              </View>

              <NoticeBox
                tone="error"
                description="카드를 삭제하면 해당 카드로는 더 이상 결제할 수 없습니다."
              />
            </>
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

      <Modal
        visible={dialog === 'default'}
        type="two"
        title={`${card.name} 카드를 대표카드로 지정하시겠습니까?`}
        description="결제 시 우선순위로 사용됩니다."
        confirmLabel="대표카드 설정하기"
        cancelLabel="닫기"
        onConfirm={async () => {
          try {
            await setManagedDefaultCard(card.id);
            setDefaultCard(card.id);
            setDialog('defaultComplete');
          } catch (error) {
            console.warn('Failed to set default card.', error);
            setDialog(null);
            setActionMessage('대표카드 설정에 실패했습니다.');
          }
        }}
        onCancel={() => setDialog(null)}
        onClose={() => setDialog(null)}
      />

      <AliasEditModal
        visible={dialog === 'alias'}
        value={aliasValue}
        onChangeText={(value) => setAliasValue(value.slice(0, 10))}
        onCancel={() => setDialog(null)}
        onConfirm={async () => {
          try {
            await updateManagedCardAlias(card.id, aliasValue);
            updateCardAlias(card.id, aliasValue);
            setDialog('aliasComplete');
          } catch (error) {
            console.warn('Failed to update card alias.', error);
            setDialog(null);
            setActionMessage('카드 별칭 수정에 실패했습니다.');
          }
        }}
      />

      <Modal
        visible={dialog === 'delete'}
        type="two"
        title={`${card.name} 카드를 삭제하시겠습니까?`}
        confirmLabel="삭제하기"
        cancelLabel="닫기"
        onConfirm={async () => {
          try {
            await deleteManagedCard(card.id);
            setDialog('deleteComplete');
          } catch (error) {
            console.warn('Failed to delete card.', error);
            setDialog(null);
            setActionMessage('카드 삭제에 실패했습니다.');
          }
        }}
        onCancel={() => setDialog(null)}
        onClose={() => setDialog(null)}
      />

      <Modal
        visible={dialog === 'defaultComplete'}
        type="one"
        title="대표카드 설정이 완료되었습니다."
        confirmLabel="확인"
        onConfirm={() => {
          setDialog(null);
          navigation.navigate('CardManagementScreen');
        }}
        onClose={() => {
          setDialog(null);
          navigation.navigate('CardManagementScreen');
        }}
      />

      <Modal
        visible={dialog === 'aliasComplete'}
        type="one"
        title="카드 별칭 수정이 완료되었습니다."
        confirmLabel="확인"
        onConfirm={() => {
          setDialog(null);
          navigation.navigate('CardManagementScreen');
        }}
        onClose={() => {
          setDialog(null);
          navigation.navigate('CardManagementScreen');
        }}
      />

      <Modal
        visible={dialog === 'deleteComplete'}
        type="one"
        title="카드 삭제가 완료되었습니다."
        confirmLabel="확인"
        onConfirm={() => {
          deleteCard(card.id);
          setDialog(null);
          navigation.navigate('CardManagementScreen');
        }}
        onClose={() => {
          deleteCard(card.id);
          setDialog(null);
          navigation.navigate('CardManagementScreen');
        }}
      />

      <Modal
        visible={Boolean(actionMessage)}
        type="one"
        title={actionMessage ?? ''}
        confirmLabel="확인"
        onConfirm={() => setActionMessage(null)}
        onClose={() => setActionMessage(null)}
      />
    </>
  );
}

function PaymentMiniRow({
  title,
  statusType,
  date,
  amount,
}: {
  title: string;
  statusType: PaymentStatus;
  date: string;
  amount: string;
}) {
  return (
    <View className="py-3">
      <View className="flex-row items-center justify-between gap-3">
        <Text
          numberOfLines={1}
          className="min-w-0 flex-1 font-pretendard text-large-bold text-neutral-black1"
        >
          {title}
        </Text>
        <PaymentStatusBadge status={statusType} />
      </View>
      <View className="mt-2 flex-row items-center justify-between">
        <Text className="font-pretendard text-normal-regular text-neutral-black2">
          {date}
        </Text>
        <Text className="font-pretendard text-large-bold text-neutral-black1">
          {amount}
        </Text>
      </View>
    </View>
  );
}

function InfoRow({
  label,
  value,
  valueClassName = 'text-neutral-black1',
  badge,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  badge?: string;
}) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text className="font-pretendard text-large-regular text-neutral-black2">
        {label}
      </Text>
      <View className="min-w-0 flex-1 flex-row items-center justify-end gap-2">
        {badge ? (
          <View className="rounded bg-erum-main px-2 py-0.5">
            <Text className="font-pretendard text-normal-bold text-neutral-white">
              {badge}
            </Text>
          </View>
        ) : null}
        <Text
          numberOfLines={2}
          className={`min-w-0 text-right font-pretendard text-large-bold ${valueClassName}`}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function Divider() {
  return <View className="my-2 h-px w-full bg-neutral-grey1" />;
}

function MonthlyPerformanceCard({
  performance,
  targetAmount,
}: {
  performance: CardPerformance | null;
  targetAmount?: number;
}) {
  const amount = performance?.amount ?? 0;
  const progress =
    targetAmount && targetAmount > 0
      ? Math.min(Math.max((amount / targetAmount) * 100, 0), 100)
      : 0;

  return (
    <Card title="이번 달 실적">
      <View className="gap-1">
        <PerformanceRow
          label="사용금액"
          value={performance ? formatCurrency(amount) : '-'}
          valueClassName="text-[#2F62A3]"
        />
        <PerformanceRow
          label="할인받은 금액"
          value={
            performance?.discountAmount == null
              ? '-'
              : formatCurrency(performance.discountAmount)
          }
          valueClassName="text-erum-primary"
        />

        <View className="mt-3">
          <View className="flex-row items-center justify-between">
            <Text className="font-pretendard text-normal-regular text-neutral-black2">
              실적 달성률
            </Text>
            <Text className="font-pretendard text-normal-regular text-neutral-black2">
              {targetAmount ? formatCurrency(targetAmount) : '-'}
            </Text>
          </View>
          <View className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-grey1">
            <View
              className="h-full rounded-full bg-[#2F62A3]"
              style={{ width: `${progress}%` }}
            />
          </View>
        </View>
      </View>
    </Card>
  );
}

function PerformanceRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName: string;
}) {
  return (
    <View className="flex-row items-center justify-between py-1.5">
      <Text className="font-pretendard text-large-regular text-neutral-black2">
        {label}
      </Text>
      <Text className={`font-pretendard text-large-bold ${valueClassName}`}>
        {value}
      </Text>
    </View>
  );
}

function resolvePerformanceTarget(
  currentAmount: number,
  benefits: CardBenefit[],
) {
  const thresholds = Array.from(
    new Set(
      benefits.flatMap((benefit) => benefit.performanceThresholds),
    ),
  ).sort((a, b) => a - b);

  return (
    thresholds.find((threshold) => threshold > currentAmount) ??
    thresholds.at(-1)
  );
}

function formatCurrency(value: number) {
  return `${Math.trunc(value).toLocaleString('ko-KR')}원`;
}

function AliasEditModal({
  visible,
  value,
  onChangeText,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  value: string;
  onChangeText: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <RNModal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-neutral-black3 px-9">
        <Pressable className="absolute inset-0" onPress={onCancel} />
        <View className="w-full max-w-[320px] rounded-3xl bg-neutral-white px-6 pb-6 pt-8">
          <Text className="text-center font-pretendard text-heading-3 text-neutral-black1">
            카드 별칭 수정
          </Text>
          <TextInput
            className="mt-6 h-12 rounded-xl border border-neutral-grey1 px-4 py-0 font-pretendard text-neutral-black1"
            style={{
              fontSize: 16,
              includeFontPadding: false,
              lineHeight: 20,
              paddingBottom: 0,
              paddingTop: 0,
              textAlignVertical: 'center',
            }}
            value={value}
            onChangeText={(text) => onChangeText(text.slice(0, 10))}
            maxLength={10}
            placeholder="별칭을 입력해주세요."
          />
          <View className="mt-7 gap-3">
            <Button label="저장하기" size="medium" onPress={onConfirm} />
            <Button label="닫기" variant="secondary" size="medium" onPress={onCancel} />
          </View>
        </View>
      </View>
    </RNModal>
  );
}

export default CardDetailScreen;
