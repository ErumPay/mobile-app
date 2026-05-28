/******************************************************************************
 * File: NoticeBox.tsx
 * Description: 안내/주의 문구를 묶어 보여주는 공통 노티스 박스 컴포넌트
 * Worker: [FE] 조보름
 * Created: 2026-05-29
 * Note: 결제 안내, 보안 안내, 주의사항 영역에서 재사용합니다.
 ******************************************************************************/

import { Text, View } from 'react-native';

type NoticeBoxTone = 'info' | 'success' | 'warning' | 'error';

type NoticeBoxProps = {
  title?: string;
  description: string;
  tone?: NoticeBoxTone;
};

const boxClassNameByTone: Record<NoticeBoxTone, string> = {
  info: 'border-state-sky bg-neutral-grey2',
  success: 'border-state-success bg-neutral-grey2',
  warning: 'border-state-gold bg-neutral-grey2',
  error: 'border-state-error bg-neutral-grey2',
};

const textClassNameByTone: Record<NoticeBoxTone, string> = {
  info: 'text-erum-secondary',
  success: 'text-state-success',
  warning: 'text-state-orange',
  error: 'text-state-error',
};

export function NoticeBox({
  title,
  description,
  tone = 'info',
}: NoticeBoxProps) {
  return (
    <View className={`rounded-lg border px-4 py-3 ${boxClassNameByTone[tone]}`}>
      {title ? (
        <Text className={`font-pretendard text-large-bold ${textClassNameByTone[tone]}`}>
          {title}
        </Text>
      ) : null}
      <Text className={`font-pretendard text-large-regular ${textClassNameByTone[tone]}`}>
        {description}
      </Text>
    </View>
  );
}

export default NoticeBox;
