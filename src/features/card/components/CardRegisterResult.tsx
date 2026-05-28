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
    <View className="w-full pt-6">
      <View className="w-full items-center">
        <View
          className={`h-24 w-24 items-center justify-center rounded-full ${
            isSuccess ? 'bg-emerald-300' : 'bg-red-400'
          }`}
        >
          <Text className="text-5xl font-light leading-[64px] text-white">
            {isSuccess ? '✓' : '×'}
          </Text>
        </View>

        <Text className="mt-8 text-2xl font-bold text-slate-950">
          {isSuccess ? '카드 등록 완료!' : '카드 등록 실패'}
        </Text>
        <Text className="mt-3 text-sm text-slate-500">
          {isSuccess
            ? '카드가 성공적으로 등록되었습니다'
            : '카드 등록 중 문제가 발생했습니다'}
        </Text>

        {isSuccess ? (
          <View className="mt-9 w-full rounded-xl bg-white px-4 py-4 shadow-sm">
            <InfoRow label="카드사" value="신한카드" />
            <InfoRow label="카드명" value="Deep Dream 카드" />
            <InfoRow label="등록일" value="2026.05.11" />
          </View>
        ) : (
          <View className="mt-9 w-full rounded-xl bg-white px-4 py-5 shadow-sm">
            <Text className="mb-4 text-base font-bold text-slate-950">
              실패 원인
            </Text>
            <View className="flex-row items-center">
              <Text className="mr-3 text-lg leading-5 text-red-500">•</Text>
              <Text className="text-sm text-slate-500">
                카드 정보가 일치하지 않습니다
              </Text>
            </View>
          </View>
        )}

        <View className="mt-10 w-full gap-3">
          <Pressable
            accessibilityRole="button"
            className={`min-h-[45px] w-full flex-row items-center justify-center rounded-lg px-4 py-3 ${
              isSuccess ? 'bg-emerald-300' : 'bg-blue-700'
            }`}
            onPress={isSuccess ? onGoCardManagement : onRetry}
          >
            {!isSuccess ? (
              <Text className="mr-2 text-xl font-bold text-white">↻</Text>
            ) : null}
            <Text className="text-base font-bold text-white">
              {isSuccess ? '카드 관리로 이동' : '다시 시도하기'}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            className="min-h-[45px] w-full flex-row items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-3"
            onPress={onGoHome}
          >
            <Text className="mr-2 text-base text-slate-500">🏠</Text>
            <Text className="text-base font-bold text-slate-600">홈으로 이동</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text className="text-sm text-slate-500">{label}</Text>
      <Text className="text-base font-bold text-slate-950">{value}</Text>
    </View>
  );
}

export default CardRegisterResult;
