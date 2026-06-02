import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { colors } from '../../../shared/styles/designTokens';

type Props = {
  amount: number;
};

export default function DutchPayTotalNotice({ amount }: Props) {
  return (
    <View className="flex-row items-center rounded-xl bg-neutral-grey2 px-4 py-5">
      <View className="mr-4 h-9 w-9 items-center justify-center rounded-full bg-erum-main">
        <Feather name="info" size={18} color={colors.neutral.white} />
      </View>
      <Text className="min-w-0 flex-1 font-pretendard text-large-regular text-neutral-black1">
        총 결제 금액은{' '}
        <Text className="font-pretendard text-large-bold text-erum-secondary">
          {amount.toLocaleString('ko-KR')}원
        </Text>
        입니다.
      </Text>
    </View>
  );
}
