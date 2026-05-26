import type { ReactNode } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

interface CardMobileLayoutProps {
  children: ReactNode;
  isDark?: boolean;
}

export function CardMobileLayout({
  children,
  isDark = false,
}: CardMobileLayoutProps) {
  const { width } = useWindowDimensions();

  if (width >= 768) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-xl font-bold text-zinc-950">
            모바일 기기만 지원합니다.
          </Text>
          <Text className="mt-3 text-center text-sm text-zinc-500">
            모바일 환경에서 다시 접속해주세요.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className={isDark ? 'flex-1 bg-black' : 'flex-1 bg-zinc-50'}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow"
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full min-w-[360px] max-w-[768px] self-center overflow-hidden px-4 pb-10 pt-6">
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default CardMobileLayout;
