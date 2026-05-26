import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

import {
  BottomNav,
  CardSection,
  MenuRow,
  MypageFrame,
  MypageHeader,
} from '../components/MypageLayout';

interface MypageHomeScreenProps {
  hasNotification?: boolean;
  onBack?: () => void;
  onPressProfile?: () => void;
  onPressHistory?: () => void;
  onPressCard?: () => void;
  onPressLogout?: () => void;
  onPressWithdraw?: () => void;
}

export function MypageHomeScreen({
  hasNotification = true,
  onBack,
  onPressProfile,
  onPressHistory,
  onPressCard,
  onPressLogout,
  onPressWithdraw,
}: MypageHomeScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <MypageFrame backgroundClassName="bg-white">
        <MypageHeader title="마이페이지" onBack={onBack} />
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-36 pt-4"
          showsVerticalScrollIndicator={false}
        >
          <CardSection>
            <View className="flex-row items-center">
              <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-emerald-700 shadow">
                <Text className="text-3xl text-white">♙</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-slate-950">
                  조이훈 (3293)
                </Text>
                <Text className="mt-1 text-sm text-slate-500">
                  010-0000-0000
                </Text>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              className="mt-4 h-11 w-full flex-row items-center justify-center rounded-lg bg-emerald-700"
              onPress={onPressProfile}
            >
              <Text className="text-base font-bold text-white">내 정보 확인</Text>
              <Text className="ml-2 text-2xl font-light leading-6 text-white">›</Text>
            </Pressable>
          </CardSection>

          <View className="mt-5 flex-row gap-2">
            <View className="h-[72px] flex-1 flex-row items-center rounded-lg bg-white px-4 shadow-sm">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                <Text className="text-xl text-blue-700">♙</Text>
              </View>
              <Text className="text-base font-semibold text-slate-950">친구관리</Text>
            </View>

            <View className="h-[72px] flex-1 flex-row items-center rounded-lg bg-white px-4 shadow-sm">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-orange-50">
                <Text className="text-xl text-orange-600">♧</Text>
              </View>
              <Text className="text-base font-semibold text-slate-950">알림</Text>
              {hasNotification ? (
                <View className="absolute right-3 top-3 h-2 w-2 rounded-full bg-red-500" />
              ) : null}
            </View>
          </View>

          <View className="mt-6">
            <CardSection>
              <Text className="mb-3 text-lg font-bold text-slate-950">나의 관리</Text>
              <MenuRow
                icon="▣"
                iconClassName="text-purple-600"
                title="결제내역"
                onPress={onPressHistory}
              />
              <MenuRow
                icon="▭"
                iconClassName="text-orange-600"
                title="카드관리"
                onPress={onPressCard}
              />
            </CardSection>
          </View>

          <View className="mt-6">
            <CardSection>
              <Text className="mb-3 text-lg font-bold text-slate-950">설정</Text>
              <MenuRow title="알림 설정" />
              <MenuRow title="보안 설정" />
              <MenuRow title="약관 및 정책" />
              <MenuRow title="앱 버전" value="v1.0.0" />
            </CardSection>
          </View>

          <View className="mt-6 flex-row justify-center gap-6">
            <Pressable accessibilityRole="button" onPress={onPressWithdraw}>
              <Text className="text-sm text-slate-500 underline">회원탈퇴</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onPressLogout}>
              <Text className="text-sm text-slate-500 underline">로그아웃</Text>
            </Pressable>
          </View>
        </ScrollView>
        <BottomNav active="my" />
      </MypageFrame>
    </SafeAreaView>
  );
}

export default MypageHomeScreen;
