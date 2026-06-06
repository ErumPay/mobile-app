import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { SkeletonCard } from '../../../shared/components/Skeleton';
import type { RootStackParamList } from '../../../../App';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { EmptyState } from '../../../shared/components/EmptyState';
import { NoticeBox } from '../../../shared/components/NoticeBox';
import { FloatingButton } from '../../../shared/components/FloatingButton';
import { Header } from '../../../shared/components/Header';
import { PageWrap } from '../../../shared/components/PageWrap';

import { fetchManagedCards } from '../api/mypageApi';
import { useManagedCardsStore } from '../stores/useManagedCardsStore';
import type { ManagedCard } from '../types/mypage';

type Props = NativeStackScreenProps<RootStackParamList, 'CardManagementScreen'>;

export function CardManagementScreen({ navigation }: Props) {
  const cards = useManagedCardsStore((state) => state.cards);
  const setCards = useManagedCardsStore((state) => state.setCards);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      setIsLoading(true);

      fetchManagedCards()
        .then((nextCards) => {
          if (isActive) {
            setCards(nextCards);
          }
        })
        .catch((error) => {
          console.warn('Failed to fetch managed cards.', error);
        })
        .finally(() => {
          if (isActive) {
            setIsLoading(false);
          }
        });

      return () => {
        isActive = false;
      };
    }, [setCards]),
  );

  return (
    <>
      <PageWrap
        backgroundClassName="bg-neutral-white"
        header={
          <Header
            title="카드관리"
            type="back"
            onPressLeft={() => navigation.goBack()}
          />
        }
      >
        <View className="gap-4 pb-28">
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : cards.length === 0 ? (
            <EmptyState title="등록된 카드가 없습니다." />
          ) : (
            cards.map((card) => (
              <ManagedCardItem
                key={card.id}
                card={card}
                onPress={() =>
                  navigation.navigate('CardDetailScreen', { cardId: card.id })
                }
              />
            ))
          )}

          <Button
            label="카드 추가하기"
            variant="secondary"
            onPress={() => navigation.navigate('CardRegister')}
          />

          <NoticeBox
            tone="info"
            description="등록한 카드는 결제 시 선택하여 사용할 수 있습니다. 대표카드는 자동으로 우선 선택됩니다."
          />
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
    </>
  );
}

function ManagedCardItem({
  card,
  onPress,
}: {
  card: ManagedCard;
  onPress: () => void;
}) {
  return (
    <Card onPress={onPress}>
      <View className="relative">
        <View className="flex-row items-center">
          <View className={`mr-3 h-12 w-20 rounded-lg px-2 py-2 ${card.colorClassName}`}>
            <Text className="font-pretendard text-[9px] text-neutral-white">
              {card.issuer}
            </Text>
            <Text className="mt-1 font-pretendard text-[10px] font-bold text-neutral-white">
              ****
            </Text>
          </View>

          <View className="min-w-0 flex-1">
            <View className="flex-row items-center">
              {card.isDefault ? (
                <Text className="mr-2 rounded bg-erum-main px-2 py-0.5 font-pretendard text-normal-bold text-neutral-white">
                  대표
                </Text>
              ) : null}

              <Text
                numberOfLines={1}
                className="min-w-0 flex-1 font-pretendard text-large-bold text-neutral-black1"
              >
                {card.title}
              </Text>
            </View>

            <Text className="mt-1 font-pretendard text-large-regular text-neutral-black1">
              {card.name}
            </Text>

            <Text className="mt-1 font-pretendard text-normal-regular text-neutral-black2">
              {card.alias}
            </Text>
          </View>

          <Text className="ml-2 text-heading-3 text-neutral-black2">›</Text>
        </View>

        {card.disabled ? (
          <View className="absolute -left-4 -right-4 -top-7 -bottom-4  flex-row items-center justify-center rounded-xl bg-neutral-black3/45">
            <View className="rounded-full bg-state-error px-4 py-2">
              <Text className="font-pretendard text-normal-bold text-neutral-white">
                사용불가
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    </Card>
  );
}

export default CardManagementScreen;
