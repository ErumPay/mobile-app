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
import { PaymentRequestError, requestPayment } from '../api/paymentRequestApi';
import { useRemotePaymentProgressStore } from '../stores/useRemotePaymentProgressStore';
import type { PaymentPinMode } from '../types/paymentPin.types';
import type { PaymentResultFlow } from '../types/paymentResult.types';
import { createPaymentIdempotencyKey } from '../utils/paymentIdempotencyKey';
import { setupPin } from '../../auth/api/authApi';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentPin'>;

type PaymentPinScreenText = {
  title: string;
  description: string;
  showForgotLink: boolean;
  showWarning: boolean;
};

const PIN_LENGTH = 6;
const WEAK_PIN_ERROR_MESSAGE =
  '연속 숫자 또는 동일 숫자 4자리 이상은 사용할 수 없습니다.';

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
    description: '한 번 더 입력해주세요.',
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
  const [failModalVisible, setFailModalVisible] = useState(false);
  const [stopModalVisible, setStopModalVisible] = useState(false);
  const [setupErrorMessage, setSetupErrorMessage] = useState('');

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
    setSetupErrorMessage('');
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
        setSetupErrorMessage('');
        navigation.replace('PaymentResult', {
          status: 'SUCCESS',
          flow: paymentResultFlow,
          dutchSessionId: paymentResponse.dutchSessionId ?? paymentParams.dutchSessionId,
          selectedUserIds: paymentParams.selectedUserIds,
          splitMethod: paymentParams.splitMethod,
          orderName: paymentParams.orderName,
          merchantId: paymentParams.merchantId,
        });
      } catch (error) {
        if (error instanceof PaymentRequestError && isPaymentPinError(error)) {
          const nextFailCount = error.details?.failCount ?? failCount + 1;

          setPin('');
          setHasError(true);
          setFailCount(nextFailCount);
          setSetupErrorMessage(getPaymentPinErrorMessage(error, nextFailCount));

          if (error.details?.requireSmsVerification) {
            setFailModalVisible(true);
          }

          return;
        }

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
      if (isWeakPinPattern(completedPin)) {
        setPin('');
        setHasError(true);
        setSetupErrorMessage(WEAK_PIN_ERROR_MESSAGE);
        return;
      }

      setPin('');
      setSetupErrorMessage('');
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
      setPin('');
      setHasError(true);
      setSetupErrorMessage('비밀번호가 일치하지 않습니다.\n다시 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      await setupPin(completedPin, firstPin);
      setSetupErrorMessage('');
      navigation.replace('SignupComplete');
    } catch (error) {
      setPin('');
      setHasError(true);
      setSetupErrorMessage(
        error instanceof Error ? error.message : 'PIN 설정에 실패했습니다.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePressNumber = (value: string) => {
    if (pin.length >= PIN_LENGTH || isSubmitting) {
      return;
    }

    const nextPin = `${pin}${value}`;

    setPin(nextPin);
    setHasError(false);
    setSetupErrorMessage('');

    if (nextPin.length === PIN_LENGTH) {
      void handleCompletePin(nextPin);
    }
  };

  const handleMockError = () => {
    setPin('');
    setHasError(true);
    setFailCount((prev) => prev + 1);
  };

  return (
    <PageWrap
      scroll={false}
      padded={false}
      backgroundClassName="bg-neutral-white"
      header={<Header title="" type="close" onPressRight={handlePressClose} />}
    >
      <View className="flex-1">
        <View className="flex-[0.42] items-center justify-center px-5">
          <Text className="font-pretendard text-heading-3 text-neutral-black1">
            {screenText.title}
          </Text>

          <Text className="mt-3 font-pretendard text-large-regular text-neutral-black2">
            {screenText.description}
          </Text>

          <View className="mt-8">
            <PinCodeDots
              valueLength={pin.length}
              maxLength={PIN_LENGTH}
              hasError={hasError}
            />
          </View>

          {hasError && mode === 'PAYMENT_INPUT' && !setupErrorMessage ? (
            <Text className="mt-5 font-pretendard text-normal-regular text-state-error">
              {`${failCount || 1}회 틀렸습니다.`}
            </Text>
          ) : null}

          {setupErrorMessage ? (
            <Text className="mt-5 text-center font-pretendard text-normal-regular text-state-error">
              {setupErrorMessage}
            </Text>
          ) : null}

          {screenText.showWarning && !isSubmitting ? (
            <View className="mt-12 w-full">
              <NoticeBox
                tone="warning"
                description="추측하기 쉬운 연속숫자, 동일숫자 설정은 피해주세요."
              />
            </View>
          ) : null}

          {screenText.showForgotLink && !isSubmitting ? (
            <Pressable
              accessibilityRole="button"
              className="mt-16"
              onPress={handlePressForgotPassword}
              onLongPress={__DEV__ ? handleMockError : undefined}
            >
              <Text className="font-pretendard text-normal-bold text-erum-main">
                간편 비밀번호를 잊으셨나요?
              </Text>
            </Pressable>
          ) : null}
        </View>

        <PinCodeKeypad
          onPressNumber={isSubmitting ? () => {} : handlePressNumber}
          onPressDelete={isSubmitting ? () => {} : handlePressDelete}
        />

        <PaymentStopConfirmModal
          visible={stopModalVisible}
          description={
            paymentParams?.flow === 'DUTCH_PAY'
            || paymentParams?.flow === 'REMOTE_PAYMENT'
              ? '중지하셔도 메인에서 결제 진행상태를 확인할 수 있습니다.'
              : undefined
          }
          onConfirm={handleConfirmStopPayment}
          onCancel={() => setStopModalVisible(false)}
        />

        {isSubmitting ? (
          <Loading
            overlay
            message={
              mode === 'PAYMENT_INPUT'
                ? '결제를 처리하는 중입니다.'
                : 'PIN을 등록하는 중입니다.'
            }
          />
        ) : null}
      </View>

      <Modal
        visible={failModalVisible}
        type="one"
        icon={
          <View className="h-14 w-14 items-center justify-center rounded-full bg-state-error">
            <Feather name="x" size={32} color="#FFFFFF" />
          </View>
        }
        title="10회 이상 실패했습니다."
        description="SMS 재인증 후 PIN을 다시 설정해주세요."
        confirmLabel="확인"
        onConfirm={() => {
          setFailModalVisible(false);
          navigation.replace('SmsVerification');
        }}
        onClose={() => {
          setFailModalVisible(false);
          navigation.replace('SmsVerification');
        }}
      />
    </PageWrap>
  );
}

function isWeakPinPattern(pin: string) {
  for (let index = 0; index <= pin.length - 4; index += 1) {
    const first = Number(pin[index]);
    const second = Number(pin[index + 1]);
    const third = Number(pin[index + 2]);
    const fourth = Number(pin[index + 3]);

    if (
      pin[index] === pin[index + 1]
      && pin[index] === pin[index + 2]
      && pin[index] === pin[index + 3]
    ) {
      return true;
    }

    if (second === first + 1 && third === second + 1 && fourth === third + 1) {
      return true;
    }

    if (second === first - 1 && third === second - 1 && fourth === third - 1) {
      return true;
    }
  }

  return false;
}

function isPaymentPinError(error: PaymentRequestError) {
  return error.code === 'PIN_INVALID' || error.code === 'PIN_LOCKED';
}

function getPaymentPinErrorMessage(
  error: PaymentRequestError,
  failCount: number,
) {
  if (error.details?.requireSmsVerification) {
    return '10회 이상 실패했습니다.\nSMS 재인증 후 PIN을 다시 설정해주세요.';
  }

  if (error.details?.lockedUntil) {
    return '비밀번호 입력이 잠겼습니다.\n잠시 후 다시 시도해주세요.';
  }

  if (error.code === 'PIN_INVALID') {
    const remainCount = error.details?.remainCount;

    if (typeof remainCount === 'number') {
      return `비밀번호가 일치하지 않습니다.\n다시 입력해주세요 (${failCount}회, 남은 ${remainCount}회)`;
    }

    return `비밀번호가 일치하지 않습니다.\n다시 입력해주세요 (${failCount}회)`;
  }

  return error.message || '결제 비밀번호 확인에 실패했습니다.';
}
