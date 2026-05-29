/******************************************************************************
 * File: ErrorPage.tsx
 * Description: 404/500 등 서비스 오류 상태를 표시하는 공통 오류 화면 컴포넌트
 * Worker: [FE] 조보름
 * Created: 2026-05-29
 * Note: 라우팅 오류, 서버 오류 등 공통 에러 페이지에서 재사용합니다.
 ******************************************************************************/

import { Pressable, Text, View } from 'react-native';

type ErrorPageVariant = 'notFound' | 'serverError';

type ErrorPageProps = {
  variant: ErrorPageVariant;
  title?: string;
  description?: string;
  actionLabel?: string;
  onPressAction?: () => void;
};

const ERROR_PAGE_CONTENT: Record<
  ErrorPageVariant,
  { statusCode: string; title: string; description: string }
> = {
  notFound: {
    statusCode: '404',
    title: '페이지를 찾을 수 없어요',
    description: '요청하신 페이지가 삭제되었거나 주소가 변경되었어요.',
  },
  serverError: {
    statusCode: '500',
    title: '일시적인 오류가 발생했어요',
    description: '잠시 후 다시 시도해주세요.',
  },
};

export function ErrorPage({
  variant,
  title,
  description,
  actionLabel = '다시 시도',
  onPressAction,
}: ErrorPageProps) {
  const content = ERROR_PAGE_CONTENT[variant];

  return (
    <View className="flex-1 items-center justify-center bg-neutral-white px-6">
      <Text className="font-pretendard text-heading-1 text-erum-main">
        {content.statusCode}
      </Text>
      <Text className="mt-4 text-center font-pretendard text-heading-3 text-neutral-black1">
        {title ?? content.title}
      </Text>
      <Text className="mt-2 text-center font-pretendard text-large-regular text-neutral-black2">
        {description ?? content.description}
      </Text>

      {onPressAction ? (
        <Pressable
          accessibilityRole="button"
          className="mt-8 min-h-[45px] min-w-[160px] items-center justify-center rounded-lg bg-erum-main px-5 py-3"
          onPress={onPressAction}
        >
          <Text className="font-pretendard text-large-bold text-neutral-white">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default ErrorPage;
