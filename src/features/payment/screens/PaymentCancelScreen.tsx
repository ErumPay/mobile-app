import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../../App';
import Button from '../../../shared/components/Button';
import { EmptyState } from '../../../shared/components/EmptyState';
import { Header } from '../../../shared/components/Header';
import { Modal } from '../../../shared/components/Modal';
import NoticeBox from '../../../shared/components/NoticeBox';
import PageWrap from '../../../shared/components/PageWrap';
import { SkeletonCard } from '../../../shared/components/Skeleton';
import { colors } from '../../../shared/styles/designTokens';
import { fetchPaymentDetail } from '../../mypage/api/mypageApi';
import type { PaymentDetail } from '../../mypage/types/mypage';
import { cancelPayment } from '../api/paymentCancelApi';
import { createPaymentCancelIdempotencyKey } from '../utils/paymentIdempotencyKey';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentCancel'>;

function formatAmount(amount: number) {
  return `${amount.toLocaleString('ko-KR')}원`;
}

function parseAmount(amount: string) {
  const parsed = Number(amount.replace(/[^\d.-]/g, ''));

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatRefundDate() {
  const refundDate = new Date();
  refundDate.setDate(refundDate.getDate() + 7);

  return refundDate
    .toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .replace(/\. /g, '.')
    .replace(/\.$/, '');
}

function PaymentCancelSummary({ payment }: { payment: PaymentDetail }) {
  const amount = parseAmount(payment.finalAmount);

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
              {payment.paidAt}
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
              {formatAmount(amount)}
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
              {formatRefundDate()} (최대 7일 소요)
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function PaymentCancelCompleteScreenContent({
  payment,
}: {
  payment: PaymentDetail;
}) {
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
              결제가 취소되었어요.
            </Text>

            <Text className="mt-2 text-center font-pretendard text-large-regular text-neutral-disabled">
              카드사 환불 반영까지 최대 7일이 소요될 수 있습니다
            </Text>
          </View>

          <View className="mt-7">
            <PaymentCancelSummary payment={payment} />
          </View>

          <View className="mt-6">
            <NoticeBox
              tone="info"
              description="결제는 즉시 취소되었으며, 실제 환불 반영일은 카드사 사정에 따라 달라질 수 있습니다."
            />
          </View>
        </View>
      </View>
    </View>
  );
}

function PaymentCancelRequestScreenContent({
  payment,
}: {
  payment: PaymentDetail;
}) {
  const amount = parseAmount(payment.finalAmount);

  return (
    <View className="flex-1 px-4 pt-6">
      <View className="w-full max-w-sm self-center">
        <NoticeBox
          tone="warning"
          description="결제 취소는 최대 7일이 소요될 수 있습니다"
        />

        <View className="mt-10">
          <Text className="font-pretendard text-heading-2 text-neutral-black1">
            {payment.sellerName}에서
          </Text>

          <Text className="mt-3 font-pretendard text-heading-2 text-neutral-black1">
            결제한{' '}
            <Text className="text-state-error">
              {formatAmount(amount)}
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
              {formatAmount(amount)}
            </Text>
          </View>

          <View className="my-4 h-px bg-neutral-grey1" />

          <View className="flex-row items-center justify-between">
            <Text className="font-pretendard text-large-regular text-neutral-disabled">
              결제처
            </Text>
            <Text
              numberOfLines={2}
              className="min-w-0 flex-1 text-right font-pretendard text-large-bold text-neutral-black1"
            >
              {payment.sellerName}
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
  const paymentId = route.params?.paymentId;
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(paymentId));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const idempotencyKey = useMemo(
    () =>
      route.params?.idempotencyKey ??
      createPaymentCancelIdempotencyKey(paymentId ?? 0),
    [paymentId, route.params?.idempotencyKey],
  );

  useEffect(() => {
    if (!paymentId) {
      setPayment(null);
      setIsLoading(false);
      return;
    }

    let isActive = true;

    setIsLoading(true);
    setErrorMessage('');
    fetchPaymentDetail(String(paymentId))
      .then((nextPayment) => {
        if (isActive) {
          setPayment(nextPayment);
        }
      })
      .catch((error) => {
        console.warn('Failed to fetch cancel payment detail.', error);
        if (isActive) {
          setPayment(null);
          setErrorMessage('결제 정보를 불러오지 못했습니다.');
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [paymentId]);

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

  const handlePressCancel = async () => {
    if (!paymentId || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await cancelPayment(paymentId, idempotencyKey);
      navigation.replace('PaymentCancel', {
        mode: 'COMPLETE',
        paymentId,
        idempotencyKey,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '결제 취소에 실패했습니다.';
      setErrorMessage(message);
      setModalVisible(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCancelDisabled =
    !payment || payment.status !== 'completed' || isSubmitting;

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
          contentContainerClassName="flex-grow pb-28"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View className="px-4 pt-6">
              <View className="w-full max-w-sm self-center gap-4">
                <SkeletonCard />
                <SkeletonCard />
              </View>
            </View>
          ) : !payment ? (
            <View className="px-4 pt-6">
              <View className="w-full max-w-sm self-center">
                <EmptyState
                  title="결제 정보를 찾을 수 없습니다."
                  description={errorMessage || '결제내역에서 다시 시도해주세요.'}
                  actionLabel="메인으로 이동"
                  onPressAction={handlePressMain}
                />
              </View>
            </View>
          ) : isComplete ? (
            <PaymentCancelCompleteScreenContent payment={payment} />
          ) : (
            <PaymentCancelRequestScreenContent payment={payment} />
          )}
        </ScrollView>

        <View className="border-t border-neutral-grey1 bg-neutral-white px-4 pb-5 pt-4">
          <View className="w-full max-w-sm self-center">
            <Button
              label={
                isComplete ? '확인' : isSubmitting ? '취소 중' : '결제취소'
              }
              variant={isComplete ? 'primary' : 'danger'}
              size="large"
              disabled={!isComplete && isCancelDisabled}
              onPress={isComplete ? handlePressMain : handlePressCancel}
            />
          </View>
        </View>
      </View>

      <Modal
        visible={modalVisible}
        type="one"
        title="결제 취소에 실패했습니다."
        description={errorMessage || '잠시 후 다시 시도해주세요.'}
        confirmLabel="확인"
        onConfirm={() => setModalVisible(false)}
        onClose={() => setModalVisible(false)}
      />
    </PageWrap>
  );
}
