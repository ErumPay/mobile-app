import type { ReactNode } from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';

interface CardMobileLayoutProps {
  children: ReactNode;
  isDark?: boolean;
}

export function CardMobileLayout({
  children,
  isDark = false,
}: CardMobileLayoutProps) {
  return (
    <SafeAreaView
      className={isDark ? 'flex-1 bg-black' : 'flex-1 bg-zinc-50'}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow"
        keyboardShouldPersistTaps="handled"
      >
        <View
          className={`flex-1 w-full flex-col items-start self-center overflow-hidden px-4 pb-10 pt-6 ${
            isDark ? 'bg-black' : 'bg-zinc-50'
          }`}
        >
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default CardMobileLayout;
