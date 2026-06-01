import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { Header } from '../../../shared/components/Header';
import { PageWrap } from '../../../shared/components/PageWrap';
import { colors } from '../../../shared/styles/designTokens';
import { mockCardRegisterResult } from '../mocks/cardMockData';

type CardRegisterResultStatus = 'success' | 'failure';

interface CardRegisterResultScreenProps {
  status: CardRegisterResultStatus;
  onClose?: () => void;
  onRetry?: () => void;
  onGoCardManagement?: () => void;
  onGoHome?: () => void;
}

export function CardRegisterResultScreen({
  status,
  onClose,
  onRetry,
  onGoCardManagement,
  onGoHome,
}: CardRegisterResultScreenProps) {
  const isSuccess = status === 'success';

  return (
    <PageWrap
      backgroundClassName="bg-neutral-white"
      header={<Header title="카드등록" type="close" onPressRight={onClose} />}
    >
      <View className="w-full flex-1 pt-12">
        <View className="w-full items-center">
          <View
            className={`h-24 w-24 items-center justify-center rounded-full ${
              isSuccess ? 'bg-erum-primary' : 'bg-state-error'
            }`}
          >
            <Feather
              name={isSuccess ? 'check-circle' : 'x-circle'}
              size={64}
              color={colors.neutral.white}
            />
          </View>

          <Text className="mt-8 text-center font-pretendard text-heading-1 text-neutral-black1">
            {isSuccess ? '카드 등록 완료!' : '카드 등록 실패'}
          </Text>

          <Text className="mt-4 text-center font-pretendard text-heading-3 text-neutral-black2">
            {isSuccess
              ? '카드가 성공적으로 등록되었습니다'
              : '카드 등록 중 문제가 발생했습니다'}
          </Text>

          {isSuccess ? (
            <View className="mt-12 w-full">
              <Card>
                <InfoRow label="카드사" value={mockCardRegisterResult.issuer} />
                <InfoRow label="카드명" value={mockCardRegisterResult.name} />
                <InfoRow
                  label="등록일"
                  value={mockCardRegisterResult.registeredAt}
                />
              </Card>
            </View>
          ) : (
            <View className="mt-12 w-full">
              <Card>
                <Text className="mb-6 font-pretendard text-heading-3 text-neutral-black1">
                  실패 원인
                </Text>

                <View className="flex-row items-center gap-3">
                  <View className="h-2 w-2 rounded-full bg-state-error" />
                  <Text className="min-w-0 flex-1 font-pretendard text-large-regular text-neutral-black2">
                    카드 정보가 일치하지 않습니다
                  </Text>
                </View>
              </Card>
            </View>
          )}

          <View className="mt-10 w-full gap-4">
            <Button
              label={isSuccess ? '카드 관리로 이동' : '다시 시도하기'}
              leftIcon={
                isSuccess ? undefined : (
                  <Feather
                    name="refresh-cw"
                    size={22}
                    color={colors.neutral.white}
                  />
                )
              }
              onPress={isSuccess ? onGoCardManagement : onRetry}
            />

            <Button
              label="홈으로 이동"
              variant="secondary"
              leftIcon={
                <Feather name="home" size={22} color={colors.erum.main} />
              }
              onPress={onGoHome}
            />
          </View>
        </View>
      </View>
    </PageWrap>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-3">
      <Text className="font-pretendard text-heading-3 text-neutral-black2">
        {label}
      </Text>
      <Text className="min-w-0 flex-1 text-right font-pretendard text-heading-3 text-neutral-black1">
        {value}
      </Text>
    </View>
  );
}

export default CardRegisterResultScreen;