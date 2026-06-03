import { useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../../App';
import { Header } from '../../../shared/components/Header';
import { NoticeBox } from '../../../shared/components/NoticeBox';
import PageWrap from '../../../shared/components/PageWrap';
import { PinCodeDots, PinCodeKeypad } from '../../../shared/components/PinCode';
import { Loading } from '../../../shared/components/Loading';
import PaymentStopConfirmModal from '../components/PaymentStopConfirmModal';
import type { PaymentPinMode } from '../types/paymentPin.types';
import { requestPayment } from '../api/paymentRequestApi';
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
    showWarning: true,
  },
};

export default function PaymentPinScreen({ navigation, route }: Props) {
  const mode = route.params?.mode ?? 'PAYMENT_INPUT';
  const screenText = screenTextByMode[mode];
  const paymentParams =
    route.params?.mode === 'PAYMENT_INPUT' ? route.params : null;
  const paymentResultFlow: PaymentResultFlow =
    paymentParams?.flow === 'DUTCH_PAY' ? 'DUTCH_PAY_PRE_AUTH' : 'NORMAL';

  const [pin, setPin] = useState('');
  const [hasError, setHasError] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stopModalVisible, setStopModalVisible] = useState(false);
  const idempotencyKey = useMemo(() => {
    const paymentId = paymentParams?.paymentId;

    if (paymentId == null) {
      return undefined;
    }

    return (
      paymentParams?.idempotencyKey ?? createPaymentIdempotencyKey(paymentId)
    );
  }, [paymentParams]);

  const handlePressClose = () => {
    if (mode === 'PAYMENT_INPUT') {
      setStopModalVisible(true);
      return;
    }

    navigation.goBack();
  };

  const handleConfirmStopPayment = () => {
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

        await requestPayment(
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

        setPin('');
        setHasError(false);
        navigation.replace('PaymentResult', {
          status: 'SUCCESS',
          flow: paymentResultFlow,
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
      navigation.replace('PaymentPin', { mode: 'CONFIRM' });
      return;
    }

    Alert.alert('간편비밀번호', '간편비밀번호 등록이 완료되었습니다.');
  };

  const handlePressNumber = (value: string) => {
    if (pin.length >= PIN_LENGTH || isSubmitting) {
      return;
    }

    const nextPin = `${pin}${value}`;

    setPin(nextPin);
    setHasError(false);

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
      header={
        <Header title="" type="close" onPressRight={handlePressClose} />
      }
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

          {hasError ? (
            <Text className="mt-5 font-pretendard text-normal-regular text-state-error">
              {failCount || 1}회 틀렸습니다.
            </Text>
          ) : null}

          {isSubmitting ? (
            <Loading message="결제를 처리하는 중입니다." />
          ) : null}

          {screenText.showWarning && !isSubmitting ? (
            <View className="mt-12 w-full">
              <NoticeBox
                tone="warning"
                description="추측하기 쉬운 연속숫자, 동일숫자 설정은 피하세요."
              />
            </View>
          ) : null}

          {screenText.showForgotLink && !isSubmitting ? (
            <Pressable
              accessibilityRole="button"
              className="mt-16"
              onPress={handlePressForgotPassword}
              onLongPress={handleMockError}
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
              ? '중지하셔도 메인에서 결제 진행상태를 확인할 수 있습니다.'
              : undefined
          }
          onConfirm={handleConfirmStopPayment}
          onCancel={() => setStopModalVisible(false)}
        />
      </View>
    </PageWrap>
  );
}
