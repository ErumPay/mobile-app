import { Pressable, Text, View } from 'react-native';

type CardRegisterResultStatus = 'success' | 'failure';

interface CardRegisterResultProps {
  status: CardRegisterResultStatus;
  onRetry?: () => void;
  onGoCardManagement?: () => void;
  onGoHome?: () => void;
}

export function CardRegisterResult({
  status,
  onRetry,
  onGoCardManagement,
  onGoHome,
}: CardRegisterResultProps) {
  const isSuccess = status === 'success';

  return (
    <View className="flex-1 items-center px-1 pt-10">
      <View
        className={`h-24 w-24 items-center justify-center rounded-full ${
          isSuccess ? 'bg-emerald-500' : 'bg-red-500'
        }`}
      >
        <Text className="text-5xl font-bold text-white">
          {isSuccess ? '✓' : '×'}
        </Text>
      </View>

      <Text className="mt-8 text-2xl font-bold text-zinc-950">
        {isSuccess ? '카드 등록 완료!' : '카드 등록 실패'}
      </Text>
      <Text className="mt-3 text-base text-zinc-500">
        {isSuccess
          ? '카드가 성공적으로 등록되었습니다'
          : '카드 등록 중 문제가 발생했습니다'}
      </Text>

      {isSuccess ? (
        <View className="mt-10 w-full rounded-2xl bg-white px-6 py-5 shadow-sm">
          <View className="flex-row items-center justify-between py-2">
            <Text className="text-base text-zinc-500">카드사</Text>
            <Text className="text-base font-semibold text-zinc-950">
              신한카드
            </Text>
          </View>
          <View className="flex-row items-center justify-between py-2">
            <Text className="text-base text-zinc-500">카드명</Text>
            <Text className="text-base font-semibold text-zinc-950">
              Deep Dream 카드
            </Text>
          </View>
          <View className="flex-row items-center justify-between py-2">
            <Text className="text-base text-zinc-500">등록일</Text>
            <Text className="text-base font-semibold text-zinc-950">
              2026.05.11
            </Text>
          </View>
        </View>
      ) : (
        <View className="mt-10 w-full rounded-2xl bg-red-50 px-6 py-5">
          <Text className="text-base font-semibold text-red-700">
            카드 정보가 일치하지 않습니다
          </Text>
        </View>
      )}

      <View className="mt-10 w-full gap-3">
        <Pressable
          accessibilityRole="button"
          className={`h-14 flex-row items-center justify-center rounded-xl ${
            isSuccess ? 'bg-emerald-500' : 'bg-red-500'
          }`}
          onPress={isSuccess ? onGoCardManagement : onRetry}
        >
          <Text className="mr-2 text-lg font-bold text-white">
            {isSuccess ? '✓' : '↻'}
          </Text>
          <Text className="text-base font-semibold text-white">
            {isSuccess ? '카드 관리로 이동' : '다시 시도하기'}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          className="h-14 flex-row items-center justify-center rounded-xl bg-zinc-100"
          onPress={onGoHome}
        >
          <Text className="mr-2 text-lg font-bold text-zinc-700">⌂</Text>
          <Text className="text-base font-semibold text-zinc-700">
            홈으로 이동
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default CardRegisterResult;
