import { useState, useEffect } from 'react';
import { Modal as RNModal, Pressable, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SkeletonCard } from '../../../shared/components/Skeleton';
import type { RootStackParamList } from '../../../../App';
import { Accordion } from '../../../shared/components/Accordion';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { NoticeBox } from '../../../shared/components/NoticeBox';
import { EmptyState } from '../../../shared/components/EmptyState';
import { FloatingButton } from '../../../shared/components/FloatingButton';
import { Header } from '../../../shared/components/Header';
import { Modal } from '../../../shared/components/Modal';
import { PageWrap } from '../../../shared/components/PageWrap';
import {
  mockCardBenefits,
  mockPaymentHistories,
} from '../mocks/mypageMockData';
import { useManagedCardsStore } from '../stores/useManagedCardsStore';

type Props = NativeStackScreenProps<RootStackParamList, 'CardDetailScreen'>;
type PaymentDetailTab = 'all' | 'completed' | 'canceled';

const statusLabel = {
  completed: '결제완료',
  canceled: '결제취소',
  cancelRequested: '결제취소요청',
};

export function CardDetailScreen({ navigation, route }: Props) {
  const [dialog, setDialog] = useState<
  'default' | 'alias' | 'delete' | 'deleteComplete' | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  const timer = setTimeout(() => {
    setIsLoading(false);
  }, 700);

  return () => clearTimeout(timer);
}, []);

  const [activePaymentTab, setActivePaymentTab] =
    useState<PaymentDetailTab>('all');
  const [expandedBenefitIndex, setExpandedBenefitIndex] = useState<number | null>(
    null,
  );

  const cards = useManagedCardsStore((state) => state.cards);
  const setDefaultCard = useManagedCardsStore((state) => state.setDefaultCard);
  const deleteCard = useManagedCardsStore((state) => state.deleteCard);
  const updateCardAlias = useManagedCardsStore((state) => state.updateCardAlias);

  const card = cards.find((item) => item.id === route.params.cardId);

  const [aliasValue, setAliasValue] = useState('');

  useEffect(() => {
    if (card) {
      setAliasValue(card.alias);
    }
  }, [card?.alias]);

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
        <EmptyState title="카드 정보를 찾을 수 없습니다." />
      </PageWrap>
    );
  }

  const cardPayments = mockPaymentHistories.filter(
    (payment) => payment.cardId === card.id,
  );

  const filteredCardPayments = cardPayments.filter((payment) => {
    if (activePaymentTab === 'all') {
      return true;
    }

    if (activePaymentTab === 'completed') {
      return payment.status === 'completed';
    }

    return payment.status === 'canceled' || payment.status === 'cancelRequested';
  });

  

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
              <SkeletonCard />
            </>
          ) : (
            <>
              {card.disabled ? (
                <NoticeBox tone="error" description="사용 정지된 카드입니다." />
              ) : null}

              <Card title="카드 정보">
                {card.isDefault ? (
                  <View className="mb-3 self-start rounded bg-erum-main px-2 py-1">
                    <Text className="font-pretendard text-normal-bold text-neutral-white">
                      대표
                    </Text>
                  </View>
                ) : null}

                <InfoRow label="카드사" value={card.issuer} />
                <InfoRow label="카드명" value={card.name} />
                <InfoRow label="카드번호" value={card.cardNumber} />
                <InfoRow label="등록일" value={card.registeredAt} />
              </Card>

              <Card title="이번 달 실적">
                <InfoRow
                  label="사용금액"
                  value="245,000원"
                  valueClassName="text-erum-secondary"
                />
                <InfoRow
                  label="할인받은 금액"
                  value="12,250원"
                  valueClassName="text-erum-main"
                />
                <View className="mt-3 h-2 w-full rounded-full bg-neutral-grey1">
                  <View className="h-2 w-[84%] rounded-full bg-erum-secondary" />
                </View>
              </Card>

              <Card>
                <InfoRow label="연회비" value="면제" />
              </Card>

              <Card title="혜택">
                <View className="gap-2">
                  {mockCardBenefits.map((benefit, index) => (
                    <Accordion
                      key={benefit.title}
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
                  ))}
                </View>
              </Card>

          <Card>
            <View className="mb-3 flex-row border-b border-neutral-grey1">
              <PaymentHistoryTab
                label="전체"
                active={activePaymentTab === 'all'}
                onPress={() => setActivePaymentTab('all')}
              />

              <PaymentHistoryTab
                label="결제완료"
                active={activePaymentTab === 'completed'}
                onPress={() => setActivePaymentTab('completed')}
              />

              <PaymentHistoryTab
                label="결제취소"
                active={activePaymentTab === 'canceled'}
                onPress={() => setActivePaymentTab('canceled')}
              />
            </View>

            {filteredCardPayments.length > 0 ? (
              filteredCardPayments.map((payment, index) => (
                <View key={payment.id}>
                  {index > 0 ? <Divider /> : null}

                  <PaymentMiniRow
                    title={payment.title}
                    status={statusLabel[payment.status]}
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
            <Button label="대표카드로 설정" onPress={() => setDialog('default')} />
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
            description="카드를 삭제하면 모든 결제 내역은 유지되지만 해당 카드로는 더 이상 결제할 수 없습니다."
          />
            </>
          )}
        </View>
      </PageWrap>

      <FloatingButton
        value="my"
        onChange={(value) => {
          if (value === 'home') {
            navigation.navigate('Main');
            return;
          }

          if (value === 'payment') {
            navigation.navigate('PaymentMethodSelect');
            return;
          }

          if (value === 'my') {
            navigation.navigate('MypageHomeScreen');
          }
        }}
      />

      <Modal
        visible={dialog === 'default'}
        type="two"
        icon={<Text className="text-[52px]">⭐</Text>}
        title={`${card.name} 카드를\n대표카드로 지정 하시겠습니까?`}
        description="결제 시 우선으로 사용됩니다"
        confirmLabel="대표카드 설정하기"
        cancelLabel="닫기"
        onConfirm={() => {
          setDefaultCard(card.id);
          setDialog(null);
        }}
        onCancel={() => setDialog(null)}
        onClose={() => setDialog(null)}
      />

      <AliasEditModal
        visible={dialog === 'alias'}
        value={aliasValue}
        onChangeText={setAliasValue}
        onCancel={() => setDialog(null)}
        onConfirm={() => {
          updateCardAlias(card.id, aliasValue);
          setDialog(null);
        }}
      />

      <Modal
        visible={dialog === 'delete'}
        type="two"
        icon={<Text className="text-[52px]">🗑️</Text>}
        title={`${card.name} 카드를\n삭제하시겠습니까?`}
        confirmLabel="삭제하기"
        cancelLabel="닫기"
        onConfirm={() => {
          deleteCard(card.id);
          setDialog('deleteComplete');
        }}
        onCancel={() => setDialog(null)}
        onClose={() => setDialog(null)}
      />

      <Modal
        visible={dialog === 'deleteComplete'}
        type="one"
        icon={<Text className="text-[52px]">✅</Text>}
        title="카드 삭제가 완료되었습니다."
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
    </>
  );
}

function PaymentHistoryTab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`flex-1 pb-3 ${
        active ? 'border-b-2 border-erum-secondary' : ''
      }`}
      onPress={onPress}
    >
      <Text
        className={`text-center font-pretendard text-large-bold ${
          active ? 'text-erum-secondary' : 'text-neutral-black2'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function PaymentMiniRow({
  title,
  status,
  date,
  amount,
}: {
  title: string;
  status: string;
  date: string;
  amount: string;
}) {
  return (
    <View className="py-3">
      <View className="flex-row items-center">
        <Text className="font-pretendard text-large-bold text-neutral-black1">
          {title}
        </Text>
        <Text className="ml-2 font-pretendard text-normal-regular text-neutral-black2">
          {status}
        </Text>
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
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text className="font-pretendard text-large-regular text-neutral-black2">
        {label}
      </Text>
      <Text
        numberOfLines={2}
        className={`min-w-0 flex-1 text-right font-pretendard text-large-bold ${valueClassName}`}
      >
        {value}
      </Text>
    </View>
  );
}

function Divider() {
  return <View className="my-2 h-px w-full bg-neutral-grey1" />;
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
            className="mt-6 h-12 rounded-xl border border-neutral-grey1 px-4 font-pretendard text-large-regular text-neutral-black1"
            value={value}
            onChangeText={onChangeText}
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
