import { Text, View } from 'react-native';

import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';

import { mockCardRegisterResult } from '../mocks/cardMockData';

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
          <View className="mt-9 w-full">
            <Card>
              <InfoRow label="카드사" value={mockCardRegisterResult.issuer} />
              <InfoRow label="카드명" value={mockCardRegisterResult.name} />
              <InfoRow label="등록일" value={mockCardRegisterResult.registeredAt} />
            </Card>
          </View>
        ) : (
          <View className="mt-9 w-full">
            <Card>
              <Text className="mb-4 font-pretendard text-large-bold text-neutral-black1">
                실패 원인
              </Text>
              <Text className="font-pretendard text-large-regular text-neutral-black2">
                카드 정보가 일치하지 않습니다
              </Text>
            </Card>
          </View>
        )}

        <View className="mt-10 w-full gap-3">
          <Button
            label={isSuccess ? '카드 관리로 이동' : '다시 시도하기'}
            onPress={isSuccess ? onGoCardManagement : onRetry}
          />

          <Button
            label="홈으로 이동"
            variant="secondary"
            onPress={onGoHome}
          />
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
