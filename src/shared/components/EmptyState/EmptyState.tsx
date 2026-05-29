/******************************************************************************
 * File: EmptyState.tsx
 * Description: 데이터가 없을 때 안내 문구와 선택 액션을 표시하는 공통 빈 상태 컴포넌트
 * Worker: [FE] 조보름
 * Created: 2026-05-29
 * Note: 목록/검색/내역 화면의 empty 상태를 통일하기 위해 생성했습니다.
 ******************************************************************************/

import { Text, View } from 'react-native';

import { Button } from '../Button';

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onPressAction?: () => void;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onPressAction,
}: EmptyStateProps) {
  return (
    <View className="items-center justify-center rounded-xl bg-neutral-white px-5 py-8">
      <Text className="text-center font-pretendard text-heading-3 text-neutral-black1">
        {title}
      </Text>
      {description ? (
        <Text className="mt-2 text-center font-pretendard text-large-regular text-neutral-black2">
          {description}
        </Text>
      ) : null}
      {actionLabel && onPressAction ? (
        <View className="mt-5 w-full">
          <Button label={actionLabel} variant="secondary" onPress={onPressAction} />
        </View>
      ) : null}
    </View>
  );
}

export default EmptyState;
