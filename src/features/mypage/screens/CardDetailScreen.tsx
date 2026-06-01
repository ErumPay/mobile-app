import { useState } from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../../App';
import { Accordion } from '../../../shared/components/Accordion';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { NoticeBox } from '../../../shared/components/NoticeBox';
import {
  DeleteCardCompleteDialog,
  DeleteCardDialog,
  EditCardAliasDialog,
  SetDefaultCardDialog,
} from '../components/MypageDialogs';
import {
  Divider,
  InfoRow,
  MypageBottomNav,
  MypageFrame,
} from '../components/MypageLayout';
import {
  mockCardBenefits,
  mockManagedCards,
  mockPaymentHistories,
} from '../mocks/mypageMockData';

type Props = NativeStackScreenProps<RootStackParamList, 'CardDetailScreen'>;

export function CardDetailScreen({ navigation, route }: Props) {
  const [dialog, setDialog] = useState<
    'default' | 'alias' | 'delete' | 'deleteComplete' | null
  >(null);
  const [expandedBenefitIndex, setExpandedBenefitIndex] = useState<number | null>(
    null,
  );
  const card =
    mockManagedCards.find((item) => item.id === route.params.cardId) ??
    mockManagedCards[0];

  return (
    <>
      <MypageFrame
        title="카드 상세"
        onBack={() => navigation.goBack()}
        backgroundClassName="bg-neutral-white"
      >
        <View className="gap-5 pb-28">
          {card.disabled ? (
            <NoticeBox tone="error" description="사용 정지된 카드입니다." />
          ) : null}

          <Card title="카드 정보">
            <InfoRow label="카드사" value={card.issuer} />
            <InfoRow label="카드명" value={card.name} />
            <InfoRow label="카드번호" value={card.cardNumber} />
            <InfoRow label="등록일" value={card.registeredAt} />
          </Card>

          <Card title="이번 달 실적">
            <InfoRow label="사용금액" value="245,000원" valueClassName="text-erum-secondary" />
            <InfoRow label="할인받은 금액" value="12,250원" valueClassName="text-erum-main" />
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

          <Card title="결제내역">
            {card.hasPayments ? (
              mockPaymentHistories.slice(0, 3).map((payment, index) => (
                <View key={payment.id}>
                  {index > 0 ? <Divider /> : null}
                  <PaymentMiniRow
                    title={payment.title}
                    date={payment.date}
                    amount={payment.amount}
                  />
                </View>
              ))
            ) : (
              <Text className="font-pretendard text-large-regular text-neutral-black2">
                결제 내역이 없습니다.
              </Text>
            )}
          </Card>

          <View className="gap-3">
            <Button label="대표카드로 설정" onPress={() => setDialog('default')} />
            <Button
              label="카드 별칭 수정"
              variant="secondary"
              onPress={() => setDialog('alias')}
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
        </View>
      </MypageFrame>

      <MypageBottomNav
        active="my"
        onChange={(value) => {
          if (value === 'home') navigation.navigate('Main');
        }}
      />

      <SetDefaultCardDialog
        visible={dialog === 'default'}
        onConfirm={() => setDialog(null)}
        onClose={() => setDialog(null)}
      />
      <EditCardAliasDialog
        visible={dialog === 'alias'}
        onConfirm={() => setDialog(null)}
        onClose={() => setDialog(null)}
      />
      <DeleteCardDialog
        visible={dialog === 'delete'}
        onConfirm={() => setDialog('deleteComplete')}
        onClose={() => setDialog(null)}
      />
      <DeleteCardCompleteDialog
        visible={dialog === 'deleteComplete'}
        onConfirm={() => navigation.navigate('CardManagementScreen')}
        onClose={() => setDialog(null)}
      />
    </>
  );
}

function PaymentMiniRow({
  title,
  date,
  amount,
}: {
  title: string;
  date: string;
  amount: string;
}) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <View className="min-w-0 flex-1">
        <Text numberOfLines={1} className="font-pretendard text-large-bold text-neutral-black1">
          {title}
        </Text>
        <Text className="mt-1 font-pretendard text-normal-regular text-neutral-black2">
          {date}
        </Text>
      </View>
      <Text className="font-pretendard text-large-bold text-neutral-black1">
        {amount}
      </Text>
    </View>
  );
}

export default CardDetailScreen;
