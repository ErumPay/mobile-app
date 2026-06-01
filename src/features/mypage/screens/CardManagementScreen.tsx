import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../../App';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { EmptyState } from '../../../shared/components/EmptyState';
import { NoticeBox } from '../../../shared/components/NoticeBox';
import {
  MypageBottomNav,
  MypageFrame,
} from '../components/MypageLayout';
import { mockManagedCards } from '../mocks/mypageMockData';
import type { ManagedCard } from '../types/mypage';

type Props = NativeStackScreenProps<RootStackParamList, 'CardManagementScreen'>;

export function CardManagementScreen({ navigation }: Props) {
  const cards = mockManagedCards;

  return (
    <>
      <MypageFrame
        title="카드관리"
        onBack={() => navigation.goBack()}
        backgroundClassName="bg-neutral-white"
      >
        <View className="gap-4 pb-28">
          {cards.length === 0 ? (
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
      </MypageFrame>
      <MypageBottomNav
        active="my"
        onChange={(value) => {
          if (value === 'home') navigation.navigate('Main');
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
      <View className="flex-row items-center">
        <View className={`mr-3 h-12 w-20 rounded-lg px-2 py-2 ${card.colorClassName}`}>
          <Text className="font-pretendard text-normal-regular text-neutral-white">
            {card.issuer}
          </Text>
          <Text className="mt-1 font-pretendard text-normal-bold text-neutral-white">
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
        <View className="mt-3 rounded-lg bg-state-error px-3 py-2">
          <Text className="text-center font-pretendard text-normal-bold text-neutral-white">
            사용불가
          </Text>
        </View>
      ) : null}
    </Card>
  );
}

export default CardManagementScreen;
