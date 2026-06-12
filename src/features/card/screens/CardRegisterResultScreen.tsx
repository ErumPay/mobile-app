import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { Header } from '../../../shared/components/Header';
import { PageWrap } from '../../../shared/components/PageWrap';
import { colors } from '../../../shared/styles/designTokens';
import type { RegisteredCard } from '../types/card';

type CardRegisterResultStatus = 'success' | 'failure';
export type CardRegisterFailureType =
  | 'GENERAL'
  | 'AUTHENTICATION'
  | 'UNAVAILABLE'
  | 'SYSTEM';

interface CardRegisterResultScreenProps {
  status: CardRegisterResultStatus;
  failureType?: CardRegisterFailureType;
  onClose: () => void;
  onRetry?: () => void;
  onGoCardManagement?: () => void;
  onGoHome?: () => void;
  registeredCard?: RegisteredCard | null;
  primaryButtonLabel?: string;
}

export function CardRegisterResultScreen({
  status,
  failureType = 'GENERAL',
  onClose,
  onRetry,
  onGoCardManagement,
  onGoHome,
  registeredCard,
  primaryButtonLabel,
}: CardRegisterResultScreenProps) {
  return (
    <PageWrap
      backgroundClassName="bg-neutral-white"
      header={<Header title="카드등록" type="close" onPressRight={onClose} />}
    >
      {status === 'success' ? (
        <CardRegisterSuccessResult
          registeredCard={registeredCard}
          onGoCardManagement={onGoCardManagement}
          onGoHome={onGoHome}
          primaryButtonLabel={primaryButtonLabel}
        />
      ) : (
        <CardRegisterFailureResult
          failureType={failureType}
          onRetry={onRetry}
          onGoHome={onGoHome}
        />
      )}
    </PageWrap>
  );
}

function CardRegisterSuccessResult({
  registeredCard,
  onGoCardManagement,
  onGoHome,
  primaryButtonLabel = '카드 관리로 이동',
}: {
  registeredCard?: RegisteredCard | null;
  onGoCardManagement?: () => void;
  onGoHome?: () => void;
  primaryButtonLabel?: string;
}) {
  return (
    <View className="w-full flex-1 pt-12">
      <View className="w-full items-center">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-erum-primary">
          <Feather name="check-circle" size={64} color={colors.neutral.white} />
        </View>

        <Text className="mt-8 text-center font-pretendard text-heading-1 text-neutral-black1">
          카드 등록 완료!
        </Text>

        <Text className="mt-4 text-center font-pretendard text-heading-3 text-neutral-black2">
          카드가 성공적으로 등록되었습니다
        </Text>

        <View className="mt-12 w-full">
          <Card>
            <InfoRow label="카드사" value={registeredCard?.cardCompany ?? '-'} />
            <InfoRow label="카드명" value={registeredCard?.cardName ?? '-'} />
            <InfoRow
              label="카드번호"
              value={registeredCard?.maskedNumber ?? '-'}
            />
            <InfoRow label="등록일" value={formatToday()} />
          </Card>
        </View>

        <View className="mt-10 w-full gap-4">
          <Button label={primaryButtonLabel} onPress={onGoCardManagement} />

          <Button
            label="홈으로 이동"
            variant="secondary"
            leftIcon={<Feather name="home" size={22} color={colors.erum.main} />}
            onPress={onGoHome}
          />
        </View>
      </View>
    </View>
  );
}

function CardRegisterFailureResult({
  failureType,
  onRetry,
  onGoHome,
}: {
  failureType: CardRegisterFailureType;
  onRetry?: () => void;
  onGoHome?: () => void;
}) {
  const content = cardRegisterFailureContent[failureType];

  return (
    <View className="w-full flex-1 pt-12">
      <View className="w-full items-center">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-state-error">
          <Feather name="x-circle" size={64} color={colors.neutral.white} />
        </View>

        <Text className="mt-8 text-center font-pretendard text-heading-1 text-neutral-black1">
          {content.title}
        </Text>

        <Text className="mt-4 text-center font-pretendard text-heading-3 text-neutral-black2">
          {content.subtitle}
        </Text>

        <View className="mt-12 w-full">
          <Card>
            <Text className="mb-6 font-pretendard text-heading-3 text-neutral-black1">
              실패 원인
            </Text>

            <View className="flex-row items-center gap-3">
              <View className="h-2 w-2 rounded-full bg-state-error" />
              <Text className="min-w-0 flex-1 font-pretendard text-large-regular text-neutral-black2">
                {content.description}
              </Text>
            </View>
          </Card>
        </View>

        <View className="mt-10 w-full gap-4">
          <Button
            label={content.primaryButtonLabel}
            leftIcon={
              <Feather
                name="refresh-cw"
                size={22}
                color={colors.neutral.white}
              />
            }
            onPress={onRetry}
          />

          <Button
            label="홈으로 이동"
            variant="secondary"
            leftIcon={<Feather name="home" size={22} color={colors.erum.main} />}
            onPress={onGoHome}
          />
        </View>
      </View>
    </View>
  );
}

const cardRegisterFailureContent: Record<
  CardRegisterFailureType,
  {
    title: string;
    subtitle: string;
    description: string;
    primaryButtonLabel: string;
  }
> = {
  GENERAL: {
    title: '카드 등록 실패',
    subtitle: '입력한 카드 정보를 확인해주세요.',
    description:
      '카드 정보(번호, 유효기간, CVC)가 올바른지 다시 확인해주세요.',
    primaryButtonLabel: '다시 시도하기',
  },
  AUTHENTICATION: {
    title: '카드 등록 실패',
    subtitle: '카드 인증에 실패했습니다.',
    description:
      '비밀번호오류 등으로 인증이 제한되었습니다. 카드사를 통해 비밀번호 오류 해제 후 다시 시도해주세요.',
    primaryButtonLabel: '다시 시도하기',
  },
  UNAVAILABLE: {
    title: '사용할 수 없는 카드입니다.',
    subtitle: '다른 카드를 등록해주세요.',
    description:
      '유효기간이 만료되었거나 정지된 카드입니다. 다른 카드를 사용해주세요.',
    primaryButtonLabel: '다른 카드 등록하기',
  },
  SYSTEM: {
    title: '잠시 후 다시 시도해주세요.',
    subtitle: '카드 등록을 완료하지 못했습니다.',
    description:
      '네트워크 연결이 불안정하거나 시스템 점검 중입니다. 잠시 후 다시 시도해주세요.',
    primaryButtonLabel: '확인',
  },
};

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

function formatToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, '0');
  const day = `${today.getDate()}`.padStart(2, '0');

  return `${year}.${month}.${day}`;
}

export default CardRegisterResultScreen;
