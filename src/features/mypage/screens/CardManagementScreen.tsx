import { Pressable, SafeAreaView, Text, View } from 'react-native';

import { BottomNav, MypageFrame, MypageHeader } from '../components/MypageLayout';

interface CardManagementScreenProps {
  onBack?: () => void;
  onAddCard?: () => void;
}

export function CardManagementScreen({
  onBack,
  onAddCard,
}: CardManagementScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <MypageFrame backgroundClassName="bg-white">
        <MypageHeader title="카드관리" onBack={onBack} />
        <View className="flex-1 px-4 pt-6">
          <View className="h-12 items-center justify-center rounded-xl bg-white shadow-sm">
            <Text className="text-sm text-slate-500">등록된 카드가 없습니다.</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            className="mt-3 h-20 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white"
            onPress={onAddCard}
          >
            <View className="h-8 w-8 items-center justify-center rounded-full bg-blue-700">
              <Text className="text-2xl leading-7 text-white">+</Text>
            </View>
            <Text className="mt-2 text-base font-bold text-slate-950">
              카드 추가하기
            </Text>
          </Pressable>

          <View className="mt-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-4">
            <Text className="text-sm leading-6 text-blue-900">
              💳 등록된 카드는 결제 시 선택하여 사용할 수 있습니다.
            </Text>
            <Text className="text-sm leading-6 text-blue-900">
              대표 카드는 자동으로 우선 선택됩니다.
            </Text>
          </View>
        </View>
        <BottomNav active="pay" />
      </MypageFrame>
    </SafeAreaView>
  );
}

export default CardManagementScreen;
