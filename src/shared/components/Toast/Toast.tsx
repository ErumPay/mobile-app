/******************************************************************************
 * File: Toast.tsx
 * Description: 성공/오류/안내 메시지를 짧게 노출하는 공통 토스트 컴포넌트
 * Worker: [FE] 조보름
 * Created: 2026-05-29
 * Note: 화면 전환 없이 사용자 피드백을 제공할 때 사용합니다.
 ******************************************************************************/

import { Text, View } from 'react-native';

type ToastType = 'success' | 'error' | 'info';

type ToastProps = {
  visible: boolean;
  message: string;
  type?: ToastType;
};

const toastClassNameByType: Record<ToastType, string> = {
  success: 'bg-state-success',
  error: 'bg-state-error',
  info: 'bg-erum-secondary',
};

export function Toast({ visible, message, type = 'info' }: ToastProps) {
  if (!visible) {
    return null;
  }

  return (
    <View className="absolute bottom-8 left-5 right-5 z-50">
      <View
        className={`min-h-[44px] justify-center rounded-lg px-4 py-3 ${toastClassNameByType[type]}`}
      >
        <Text className="text-center font-pretendard text-large-bold text-neutral-white">
          {message}
        </Text>
      </View>
    </View>
  );
}

export default Toast;
