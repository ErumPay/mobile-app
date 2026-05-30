/******************************************************************************
 * File: PageWrap.tsx
 * Description: 모바일 화면의 SafeArea, 배경, 좌우 여백을 통일하는 공통 래퍼
 * Worker: [FE] 조보름
 * Created: 2026-05-29
 * Note: 앱 서비스 기준 모바일 화면 폭과 기본 padding을 관리하기 위해 생성했습니다.
 ******************************************************************************/

import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PageWrapProps = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
};

export function PageWrap({
  children,
  scroll = true,
  padded = true,
}: PageWrapProps) {
  const content = (
    <View className={`flex-1 ${padded ? 'px-5 py-6' : ''}`}>
      {children}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-grey2">
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow"
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

export default PageWrap;
