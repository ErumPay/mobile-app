/******************************************************************************
 * File: PageWrap.tsx
 * Description: 모바일 화면의 SafeArea, 배경, 좌우 여백을 통일하는 공통 래퍼
 * Worker: [FE] 조보름
 * Created: 2026-05-29
 * Note: 앱 서비스 기준 모바일 화면 폭과 기본 padding을 관리하기 위해 생성했습니다.
 ******************************************************************************/

import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PageWrapProps = {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  overlay?: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  backgroundClassName?: string;
  scrollContentClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
};

export function PageWrap({
                           children,
                           header,
                           footer,
                           overlay,
                           scroll = true,
                           padded = true,
                           backgroundClassName = 'bg-neutral-grey2',
                           scrollContentClassName = '',
                           bodyClassName = '',
                           footerClassName = 'border-t border-neutral-grey1 bg-neutral-white px-4 pb-5 pt-4',
                         }: PageWrapProps) {
  const bodyBaseClassName = `flex-1 ${padded ? 'px-5 py-6' : ''} ${bodyClassName}`;
  const contentContainerClassName = `flex-grow ${
    padded ? 'px-5 py-6' : ''
  } ${footer ? 'pb-28' : ''} ${scrollContentClassName}`;

  return (
      <SafeAreaView style={{ flex: 1 }}>
          <View className={`flex-1 ${backgroundClassName}`}>
              {header}

              <KeyboardAvoidingView
                  className="flex-1"
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              >
                  {scroll ? (
                      <ScrollView
                          className="flex-1"
                          contentContainerClassName={contentContainerClassName}
                          keyboardShouldPersistTaps="handled"
                      >
                          {children}
                      </ScrollView>
                  ) : (
                      <View className={bodyBaseClassName}>{children}</View>
                  )}
                  {footer ? (
                      <View className={footerClassName}>{footer}</View>
                  ) : null}
              </KeyboardAvoidingView>
              {overlay}
          </View>
      </SafeAreaView>
  );
}

export default PageWrap;
