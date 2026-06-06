import { useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../../App';
import { Header } from '../../../shared/components/Header';
import { Loading } from '../../../shared/components/Loading';
import { Modal } from '../../../shared/components/Modal';
import { NoticeBox } from '../../../shared/components/NoticeBox';
import PageWrap from '../../../shared/components/PageWrap';
import { PinCodeDots, PinCodeKeypad } from '../../../shared/components/PinCode';
import PaymentStopConfirmModal from '../components/PaymentStopConfirmModal';
import { requestPayment } from '../api/paymentRequestApi';
import { useRemotePaymentProgressStore } from '../stores/useRemotePaymentProgressStore';
import type { PaymentPinMode } from '../types/paymentPin.types';
import type { PaymentResultFlow } from '../types/paymentResult.types';
import { createPaymentIdempotencyKey } from '../utils/paymentIdempotencyKey';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentPin'>;

type PaymentPinScreenText = {
  title: string;
  description: string;
  showForgotLink: boolean;
  showWarning: boolean;
};

const PIN_LENGTH = 6;

const screenTextByMode: Record<PaymentPinMode, PaymentPinScreenText> = {
  PAYMENT_INPUT: {
    title: '간편비밀번호 입력',
    description: '6자리를 입력해주세요.',
    showForgotLink: true,
    showWarning: false,
  },
  REGISTER: {
    title: '간편비밀번호 등록',
    description: '6자리를 입력해주세요.',
    showForgotLink: false,
    showWarning: true,
  },
  CONFIRM: {
    title: '간편비밀번호 확인',
    description: '한번 더 입력해주세요.',
    showForgotLink: false,
    showWarning: false,
  },
};

export default function PaymentPinScreen({ navigation, route }: Props) {
  const mode = route.params?.mode ?? 'PAYMENT_INPUT';
  const screenText = screenTextByMode[mode];
  const paymentParams = route.params?.mode === 'PAYMENT_INPUT' ? route.params : null;

  const paymentResultFlow: PaymentResultFlow =
    paymentParams?.flow === 'DUTCH_PAY'
      ? 'DUTCH_PAY_PRE_AUTH'
      : paymentParams?.flow === 'DUTCH_PAY_FINAL'
        ? 'DUTCH_PAY_FINAL'
        : 'NORMAL';

  const [pin, setPin] = useState('');
  const [hasError, setHasError] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mismatchModalVisible, setMismatchModalVisible] = useState(false);
  const [failModalVisible, setFailModalVisible] = useState(false);
  const [stopModalVisible, setStopModalVisible] = useState(false);

  const completeRemoteRequest = useRemotePaymentProgressStore((state) => state.completeRequest);

  const idempotencyKey = useMemo(() => {
    const paymentId = paymentParams?.paymentId;

    if (paymentId == null) {
      return undefined;
    }

    return paymentParams?.idempotencyKey ?? createPaymentIdempotencyKey(paymentId);
  }, [paymentParams]);

  const handlePressClose = () => {
    if (isSubmitting) {
      return;
    }

    if (mode === 'PAYMENT_INPUT') {
      setStopModalVisible(true);
      return;
    }

    navigation.goBack();
  };

  const handleConfirmStopPayment = () => {
    if (isSubmitting) {
      return;
    }

    setStopModalVisible(false);

    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('Main');
  };

  const handlePressForgotPassword = () => {
    Alert.alert('간편비밀번호', '간편비밀번호 재설정 화면으로 이동합니다.');
  };

  const handlePressDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setHasError(false);
  };

  const handleCompletePin = async (completedPin: string) => {
    if (mode === 'PAYMENT_INPUT') {
      if (!paymentParams || !idempotencyKey) {
        setPin('');
        setHasError(true);
        navigation.replace('PaymentResult', {
          status: 'FAILURE',
          flow: paymentResultFlow,
        });
        return;
      }

      try {
        setIsSubmitting(true);

        const paymentResponse = await requestPayment(
          {
            pin: completedPin,
            paymentId: paymentParams.paymentId,
            totalAmount: paymentParams.amount,
            cards: [
              {
                cardId: paymentParams.cardId,
                amount: paymentParams.amount,
              },
            ],
          },
          idempotencyKey,
        );

        if (paymentParams.flow === 'REMOTE_PAYMENT') {
          completeRemoteRequest();
        }

        setPin('');
        setHasError(false);
        navigation.replace('PaymentResult', {
          status: 'SUCCESS',
          flow: paymentResultFlow,
          dutchSessionId: paymentResponse.dutchSessionId ?? paymentParams.dutchSessionId,
          selectedUserIds: paymentParams.selectedUserIds,
          splitMethod: paymentParams.splitMethod,
          orderName: paymentParams.orderName,
          merchantId: paymentParams.merchantId,
        });
      } catch {
        setPin('');
        setHasError(true);
        setFailCount((prev) => prev + 1);
        navigation.replace('PaymentResult', {
          status: 'FAILURE',
          flow: paymentResultFlow,
        });
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    if (mode === 'REGISTER') {
      setPin('');
      navigation.replace('PaymentPin', {
        mode: 'CONFIRM',
        firstPin: completedPin,
      });
      return;
    }

    const firstPin = route.params?.mode === 'CONFIRM' ? route.params.firstPin : null;

    if (!firstPin) {
      navigation.replace('PaymentPin', { mode: 'REGISTER' });
      return;
    }

    if (completedPin !== firstPin) {
      const nextFailCount = failCount + 1;

      setPin('');
      setHasError(true);
      setFailCount(nextFailCount);

      if (nextFailCount >= 10) {
        setFailModalVisible(true);
      } else {
        setMismatchModalVisible(true);
      }

      return;
    }

    navigation.replace('SignupComplete');
  };

  const handlePressNumber = (value: string) => {
    if (pin.length >= PIN_LENGTH || isSubmitting) {
      return;
    }

    const nextPin = `${pin}${value}`;

    setPin(nextPin);

    if (nextPin.length === PIN_LENGTH) {
      void handleCompletePin(nextPin);
    }
  };

  return (
    <PageWrap
      scroll={false}
      padded={false}
      backgroundClassName="bg-neutral-white"
      header={
        <>
          <Header
            title={screenText.title}
            type="close"
            onPressRight={handlePressClose}
          />
          <View className="h-px bg-neutral-grey1" />
        </>
      }
    >
      <View className="flex-1">
        <View className="flex-[0.42] items-center justify-center px-4">
          <Text className="text-center font-pretendard text-large-regular text-neutral-black2">
            {screenText.description}
          </Text>

          <View className="mt-8">
            <PinCodeDots
              valueLength={pin.length}
              maxLength={PIN_LENGTH}
              hasError={hasError}
            />
          </View>

          {hasError ? (
            <Text className="mt-4 font-pretendard text-normal-regular text-state-error">
              비밀번호를 다시 확인해주세요.
            </Text>
          ) : null}

          {screenText.showForgotLink ? (
            <Pressable
              accessibilityRole="button"
              className="mt-6 flex-row items-center gap-1"
              onPress={handlePressForgotPassword}
            >
              <Text className="font-pretendard text-normal-bold text-erum-secondary">
                비밀번호를 잊으셨나요?
              </Text>
              <Feather name="chevron-right" size={16} color="#006CFF" />
            </Pressable>
          ) : null}

          {screenText.showWarning ? (
            <View className="mt-6 w-full">
              <NoticeBox
                tone="warning"
                description="간편비밀번호는 결제에 사용되니 다른 사람에게 알려주지 마세요."
              />
            </View>
          ) : null}
        </View>

        <PinCodeKeypad
          onPressNumber={handlePressNumber}
          onPressDelete={handlePressDelete}
        />
      </View>

      {isSubmitting ? <Loading fullScreen message="결제 요청 중입니다." /> : null}

      <PaymentStopConfirmModal
        visible={stopModalVisible}
        onConfirm={handleConfirmStopPayment}
        onCancel={() => setStopModalVisible(false)}
      />

      <Modal
        visible={mismatchModalVisible}
        type="one"
        title="비밀번호가 일치하지 않습니다."
        confirmLabel="확인"
        onConfirm={() => setMismatchModalVisible(false)}
        onClose={() => setMismatchModalVisible(false)}
      />

      <Modal
        visible={failModalVisible}
        type="one"
        title="비밀번호 입력 횟수를 초과했습니다."
        description="잠시 후 다시 시도해주세요."
        confirmLabel="확인"
        onConfirm={() => setFailModalVisible(false)}
        onClose={() => setFailModalVisible(false)}
      />
    </PageWrap>
  );
}
