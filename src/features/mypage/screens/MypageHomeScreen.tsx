import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

import {
  BottomNav,
  CardSection,
  Divider,
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
  hasNotification = false,
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
          className="w-full flex-1 bg-white"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full px-4 pb-44 pt-4">
            <CardSection>
              <View className="w-full flex-row items-center">
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
                className="mt-4 h-11 w-full flex-row items-center justify-center rounded-xl bg-emerald-700"
                onPress={onPressProfile}
              >
                <Text className="text-base font-bold text-white">
                  내 정보 확인
                </Text>
                <Text className="ml-2 text-2xl font-light leading-6 text-white">
                  ›
                </Text>
              </Pressable>
            </CardSection>

            <View className="mt-5 w-full flex-row">
              <ShortcutCard
                icon="♙"
                iconBgClassName="bg-blue-50"
                iconTextClassName="text-blue-700"
                title="친구관리"
              />
              <View className="w-2" />
              <ShortcutCard
                icon="♧"
                iconBgClassName="bg-orange-50"
                iconTextClassName="text-orange-600"
                title="알림"
                hasBadge={hasNotification}
              />
            </View>

            <View className="mt-6 w-full">
              <CardSection>
                <Text className="mb-3 text-lg font-bold text-slate-950">
                  나의 관리
                </Text>
                <MenuRow
                  icon="▣"
                  iconBgClassName="bg-purple-50"
                  iconTextClassName="text-purple-600"
                  title="결제내역"
                  onPress={onPressHistory}
                />
                <Divider />
                <MenuRow
                  icon="▭"
                  iconBgClassName="bg-orange-50"
                  iconTextClassName="text-orange-600"
                  title="카드관리"
                  onPress={onPressCard}
                />
              </CardSection>
            </View>

            <View className="mt-6 w-full">
              <CardSection>
                <Text className="mb-3 text-lg font-bold text-slate-950">
                  설정
                </Text>
                <MenuRow title="알림 설정" />
                <Divider />
                <MenuRow title="보안 설정" />
                <Divider />
                <MenuRow title="약관 및 정책" />
                <Divider />
                <MenuRow title="앱 버전" value="v1.0.0" />
              </CardSection>
            </View>

            <View className="mt-6 w-full flex-row items-center justify-center">
              <Pressable accessibilityRole="button" onPress={onPressWithdraw}>
                <Text className="text-sm text-slate-500 underline">
                  회원탈퇴
                </Text>
              </Pressable>
              <View className="w-6" />
              <Pressable accessibilityRole="button" onPress={onPressLogout}>
                <Text className="text-sm text-slate-500 underline">
                  로그아웃
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
        <BottomNav active="my" />
      </MypageFrame>
    </SafeAreaView>
  );
}

function ShortcutCard({
  icon,
  iconBgClassName,
  iconTextClassName,
  title,
  hasBadge = false,
}: {
  icon: string;
  iconBgClassName: string;
  iconTextClassName: string;
  title: string;
  hasBadge?: boolean;
}) {
  return (
    <View className="h-[72px] flex-1 flex-row items-center rounded-xl border border-zinc-100 bg-white px-4 shadow-sm">
      <View
        className={`mr-3 h-10 w-10 items-center justify-center rounded-full ${iconBgClassName}`}
      >
        <Text className={`text-xl ${iconTextClassName}`}>{icon}</Text>
      </View>
      <Text className="text-base font-semibold text-slate-950">{title}</Text>
      {hasBadge ? (
        <View className="absolute right-3 top-3 h-2 w-2 rounded-full bg-red-500" />
      ) : null}
    </View>
  );
}

export default MypageHomeScreen;
