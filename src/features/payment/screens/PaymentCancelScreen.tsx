import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../../App';
import Button from '../../../shared/components/Button';
import { Header } from '../../../shared/components/Header';
import NoticeBox from '../../../shared/components/NoticeBox';
import PageWrap from '../../../shared/components/PageWrap';
import { colors } from '../../../shared/styles/designTokens';
import { mockPaymentCancelDetail } from '../constants/paymentCancel.mock';
import { createPaymentCancelIdempotencyKey } from '../utils/paymentIdempotencyKey';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentCancel'>;

function formatAmount(amount: number) {
  return `${amount.toLocaleString('ko-KR')}원`;
}

function PaymentCancelSummary() {
  const detail = mockPaymentCancelDetail;

  return (
    <View className="rounded-xl border border-neutral-grey1 bg-neutral-white p-4">
      <Text className="font-pretendard text-large-bold text-neutral-black1">
        결제내역 상세내역
      </Text>

      <View className="mt-3 h-px bg-neutral-grey1" />

      <View className="mt-3 gap-4">
        <View className="flex-row gap-3">
          <Feather name="calendar" size={18} color={colors.neutral.disabled} />
          <View>
            <Text className="font-pretendard text-small-regular text-neutral-disabled">
              결제 일시
            </Text>
            <Text className="mt-1 font-pretendard text-normal-bold text-neutral-black1">
              {detail.paymentDate}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3">
          <Feather name="credit-card" size={18} color={colors.neutral.disabled} />
          <View>
            <Text className="font-pretendard text-small-regular text-neutral-disabled">
              판매 예정금액
            </Text>
            <Text className="mt-1 font-pretendard text-normal-bold text-neutral-black1">
              {formatAmount(detail.amount)}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3">
          <Feather name="calendar" size={18} color={colors.neutral.disabled} />
          <View>
            <Text className="font-pretendard text-small-regular text-neutral-disabled">
              환불 예정일
            </Text>
            <Text className="mt-1 font-pretendard text-normal-bold text-state-error">
              {detail.refundDate} (최대 7일 소요)
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function PaymentCancelCompleteScreenContent() {
  return (
    <View className="flex-1 px-4">
      <View className="flex-1 justify-start pt-7">
        <View className="w-full max-w-sm self-center">
          <View className="items-center">
            <View
              className="aspect-square w-[18%] min-w-16 max-w-20 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.state.success }}
            >
              <Feather name="check" size={36} color={colors.neutral.white} />
            </View>

            <Text className="mt-5 text-center font-pretendard text-heading-2 text-neutral-black1">
              결제를 취소 요청했어요.
            </Text>

            <Text className="mt-2 text-center font-pretendard text-large-regular text-neutral-disabled">
              취소 처리까지 최대 7일이 소요됩니다
            </Text>
          </View>

          <View className="mt-7">
            <PaymentCancelSummary />
          </View>

          <View className="mt-6 rounded-xl bg-neutral-grey1 px-5 py-4">
            <Text className="font-pretendard text-normal-regular text-neutral-black2">
              환불 예정일은 카드사 사정에 따라 변경될 수 있습니다. 정확한 환불 일정은 카드사에 문의해주세요.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function PaymentCancelRequestScreenContent() {
  const detail = mockPaymentCancelDetail;

  return (
    <View className="flex-1 px-4 pt-6">
      <View className="w-full max-w-sm self-center">
        <NoticeBox
          tone="warning"
          description="결제 취소는 최대 7일이 소요될 수 있습니다"
        />

        <View className="mt-10">
          <Text className="font-pretendard text-heading-2 text-neutral-black1">
            {detail.merchantName}에서
          </Text>

          <Text className="mt-3 font-pretendard text-heading-2 text-neutral-black1">
            결제한{' '}
            <Text className="text-state-error">
              {formatAmount(detail.amount)}
            </Text>
            을 취소합니다.
          </Text>
        </View>

        <View className="mt-8 rounded-xl bg-neutral-grey2 px-4 py-5">
          <View className="flex-row items-center justify-between">
            <Text className="font-pretendard text-large-regular text-neutral-disabled">
              결제 금액
            </Text>
            <Text className="font-pretendard text-large-bold text-neutral-black1">
              {formatAmount(detail.amount)}
            </Text>
          </View>

          <View className="my-4 h-px bg-neutral-grey1" />

          <View className="flex-row items-center justify-between">
            <Text className="font-pretendard text-large-regular text-neutral-disabled">
              결제처
            </Text>
            <Text className="font-pretendard text-large-bold text-neutral-black1">
              {detail.merchantName}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function PaymentCancelScreen({ navigation, route }: Props) {
  const mode = route.params?.mode ?? 'REQUEST';
  const isComplete = mode === 'COMPLETE';
  const paymentId = route.params?.paymentId ?? mockPaymentCancelDetail.paymentId;
  const idempotencyKey = useMemo(
    () =>
      route.params?.idempotencyKey ??
      createPaymentCancelIdempotencyKey(paymentId),
    [paymentId, route.params?.idempotencyKey],
  );

  const handlePressClose = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('Main');
  };

  const handlePressMain = () => {
    navigation.navigate('Main');
  };

  const handlePressCancel = () => {
    navigation.replace('PaymentCancel', {
      mode: 'COMPLETE',
      paymentId,
      idempotencyKey,
    });
  };

  return (
    <PageWrap
      scroll={false}
      padded={false}
      backgroundClassName="bg-neutral-white"
      header={
        <Header
          title="결제 취소"
          type="close"
          onPressRight={handlePressClose}
        />
      }
    >
      <View className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow pb-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {isComplete ? (
            <PaymentCancelCompleteScreenContent />
          ) : (
            <PaymentCancelRequestScreenContent />
          )}
        </ScrollView>

        <View className="border-t border-neutral-grey1 bg-neutral-white px-4 pb-5 pt-4">
          <View className="w-full max-w-sm self-center">
            <Button
              label={isComplete ? '확인' : '취소하기'}
              variant={isComplete ? 'primary' : 'danger'}
              size="large"
              onPress={isComplete ? handlePressMain : handlePressCancel}
            />
          </View>
        </View>
      </View>
    </PageWrap>
  );
}
