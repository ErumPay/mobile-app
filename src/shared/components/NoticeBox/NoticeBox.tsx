/******************************************************************************
 * File: NoticeBox.tsx
 * Description: 안내/주의 문구를 묶어 보여주는 공통 노티스 박스 컴포넌트
 * Worker: [FE] 조보름
 * Created: 2026-05-29
 * Note: 결제 안내, 보안 안내, 주의사항 영역에서 재사용합니다.
 ******************************************************************************/

import { Feather } from '@expo/vector-icons';
import type { ViewStyle } from 'react-native';
import { Text, View } from 'react-native';

import { colors } from '../../styles/designTokens';

type NoticeBoxTone = 'info' | 'success' | 'warning' | 'error';

type NoticeBoxProps = {
  title?: string;
  description: string;
  tone?: NoticeBoxTone;
};

const boxClassNameByTone: Record<NoticeBoxTone, string> = {
  info: 'border-state-sky',
  success: 'border-state-success',
  warning: 'border-state-orange',
  error: 'border-state-error',
};

const textClassNameByTone: Record<NoticeBoxTone, string> = {
  info: 'text-erum-secondary',
  success: 'text-state-success',
  warning: 'text-state-orange',
  error: 'text-state-error',
};

const iconColorByTone: Record<NoticeBoxTone, string> = {
  info: colors.erum.secondary,
  success: colors.state.success,
  warning: colors.state.orange,
  error: colors.state.error,
};

const boxStyleByTone: Record<NoticeBoxTone, ViewStyle> = {
  info: {
    backgroundColor: '#F1FBFF',
  },
  success: {
    backgroundColor: '#F2FBF4',
  },
  warning: {
    backgroundColor: '#FFF5F2',
  },
  error: {
    backgroundColor: '#FFF3F3',
  },
};

export function NoticeBox({
  title,
  description,
  tone = 'info',
}: NoticeBoxProps) {
  return (
    <View
      className={`flex-row items-center gap-2 rounded-lg border px-4 py-3 ${boxClassNameByTone[tone]}`}
      style={boxStyleByTone[tone]}
    >
      <Feather
        name="alert-circle"
        size={16}
        color={iconColorByTone[tone]}
      />

      <View className="min-w-0 flex-1">
        {title ? (
          <Text className={`font-pretendard text-normal-bold ${textClassNameByTone[tone]}`}>
            {title}
          </Text>
        ) : null}
        <Text className={`font-pretendard text-normal-regular ${textClassNameByTone[tone]}`}>
          {description}
        </Text>
      </View>
    </View>
  );
}

export default NoticeBox;
