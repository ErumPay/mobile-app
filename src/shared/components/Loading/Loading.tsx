/******************************************************************************
 * File: Loading.tsx
 * Description: 비동기 처리 중 사용자에게 진행 상태를 표시하는 공통 로딩 컴포넌트
 * Worker: [FE] 조보름
 * Created: 2026-05-29
 * Note: 화면 전체/부분 영역 로딩 상태에서 재사용합니다.
 ******************************************************************************/

import { ActivityIndicator, Text, View } from 'react-native';

import { colors } from '../../styles';

type LoadingProps = {
  message?: string;
  fullScreen?: boolean;
  overlay?: boolean;
};

export function Loading({
  message = '불러오는 중입니다.',
  fullScreen = false,
  overlay = false,
}: LoadingProps) {
  if (overlay) {
    return (
      <View className="absolute inset-0 z-50 items-center justify-center bg-neutral-black1/45 px-8">
        <View className="min-w-[180px] items-center justify-center gap-3 rounded-lg bg-neutral-white px-6 py-5">
          <ActivityIndicator color={colors.erum.main} size="large" />
          <Text className="text-center font-pretendard text-large-regular text-neutral-black2">
            {message}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      className={`items-center justify-center gap-3 ${
        fullScreen ? 'flex-1 bg-neutral-white' : 'py-8'
      }`}
    >
      <ActivityIndicator color={colors.erum.main} size="large" />
      <Text className="font-pretendard text-large-regular text-neutral-black2">
        {message}
      </Text>
    </View>
  );
}

export default Loading;
