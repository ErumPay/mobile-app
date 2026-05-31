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
  header?: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  backgroundClassName?: string;
};

export function PageWrap({
                           children,
                           header,
                           scroll = true,
                           padded = true,
                           backgroundClassName = 'bg-neutral-grey2',
                         }: PageWrapProps) {
  const contentClassName = `flex-1 ${padded ? 'px-5 py-6' : ''}`;

  return (
      <SafeAreaView className={`flex-1 ${backgroundClassName}`}>
        {header}

        {scroll ? (
            <ScrollView
                className="flex-1"
                contentContainerClassName={`flex-grow ${padded ? 'px-5 py-6' : ''}`}
                keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
        ) : (
            <View className={contentClassName}>{children}</View>
        )}
      </SafeAreaView>
  );
}

export default PageWrap;