import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
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
import {
  canUseBiometricPaymentAuth,
  disableBiometricPayment,
  enableBiometricPayment,
  getBiometricPaymentPin,
  isBiometricPaymentEnabled,
} from '../utils/biometricPaymentAuth';
import { resetPin, setupPin } from '../../auth/api/authApi';

type Props = Partial<NativeStackScreenProps<RootStackParamList, 'PaymentPin'>>;

type PaymentPinScreenText = {
  title: string;
  description: string;
  showForgotLink: boolean;
  showWarning: boolean;
};

const PIN_LENGTH = 6;
const PIN_LOCK_DURATION_SECONDS = 5 * 60;
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
  const routeParams = route?.params;
  const mode = routeParams?.mode ?? 'PAYMENT_INPUT';
  const paymentParams = routeParams?.mode === 'PAYMENT_INPUT' ? routeParams : null;
  const setupFlow =
    routeParams?.mode === 'REGISTER' || routeParams?.mode === 'CONFIRM'
      ? routeParams.flow ?? 'SIGNUP'
      : 'SIGNUP';
  const isPinResetFlow = setupFlow === 'PIN_RESET';
  const screenText = isPinResetFlow && mode === 'REGISTER'
    ? {
        ...screenTextByMode.REGISTER,
        title: '간편비밀번호 재설정',
        description: '새 비밀번호 6자리를 입력해주세요.',
      }
    : screenTextByMode[mode];

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
  const [weakPinModalVisible, setWeakPinModalVisible] = useState(false);
  const [mismatchModalVisible, setMismatchModalVisible] = useState(false);
  const [resetCompleteModalVisible, setResetCompleteModalVisible] = useState(false);
  const [biometricSetupModalVisible, setBiometricSetupModalVisible] = useState(false);
  const [pendingBiometricPin, setPendingBiometricPin] = useState('');
  const [biometricSetupNextScreen, setBiometricSetupNextScreen] =
    useState<'SIGNUP_COMPLETE' | 'MYPAGE_RESET'>('SIGNUP_COMPLETE');
  const [canUseBiometric, setCanUseBiometric] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [hasTriedBiometric, setHasTriedBiometric] = useState(false);
  const [setupErrorMessage, setSetupErrorMessage] = useState('');
  const [pinLockedUntil, setPinLockedUntil] = useState<number | null>(null);
  const [pinLockRemainingSeconds, setPinLockRemainingSeconds] = useState(0);

  const completeRemoteRequest = useRemotePaymentProgressStore((state) => state.completeRequest);

  const navigateToMain = () => {
    navigation?.navigate('Main');
  };

  const navigateToMypage = () => {
    navigation?.navigate('MypageHomeScreen');
  };

  const goBackOrMain = () => {
    if (navigation?.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigateToMain();
  };

  const idempotencyKey = useMemo(() => {
    const paymentId = paymentParams?.paymentId;

    if (paymentId == null) {
      return undefined;
    }

    return paymentParams?.idempotencyKey ?? createPaymentIdempotencyKey(paymentId);
  }, [paymentParams]);

  const retryPaymentResultParams = paymentParams
    ? {
        paymentId: paymentParams.paymentId,
        remoteRequestId: paymentParams.remoteRequestId,
        amount: paymentParams.amount,
        retryFlow: paymentParams.flow,
        idempotencyKey,
        dutchSessionId: paymentParams.dutchSessionId,
        selectedUserIds: paymentParams.selectedUserIds,
        splitMethod: paymentParams.splitMethod,
        orderName: paymentParams.orderName,
        merchantId: paymentParams.merchantId,
      }
    : {};

  useEffect(() => {
    let isMounted = true;

    const loadBiometricState = async () => {
      try {
        const [nextCanUseBiometric, nextBiometricEnabled] = await Promise.all([
          canUseBiometricPaymentAuth(),
          isBiometricPaymentEnabled(),
        ]);

        if (isMounted) {
          setCanUseBiometric(nextCanUseBiometric);
          setBiometricEnabled(nextBiometricEnabled);
        }
      } catch {
        if (isMounted) {
          setCanUseBiometric(false);
          setBiometricEnabled(false);
        }
      }
    };

    void loadBiometricState();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!pinLockedUntil) {
      setPinLockRemainingSeconds(0);
      return undefined;
    }

    const updateRemainingSeconds = () => {
      const nextRemainingSeconds = Math.max(
        0,
        Math.ceil((pinLockedUntil - Date.now()) / 1000),
      );

      setPinLockRemainingSeconds(nextRemainingSeconds);

      if (nextRemainingSeconds <= 0) {
        setPinLockedUntil(null);
      }
    };

    updateRemainingSeconds();
    const intervalId = setInterval(updateRemainingSeconds, 1000);

    return () => clearInterval(intervalId);
  }, [pinLockedUntil]);

  const handlePressClose = () => {
    if (isSubmitting) {
      return;
    }

    if (mode === 'PAYMENT_INPUT') {
      setStopModalVisible(true);
      return;
    }

    // PIN_RESET or SIGNUP flow both show stop modal
    setStopModalVisible(true);
  };

  const handleConfirmStopFlow = () => {
    if (isSubmitting) {
      return;
    }

    setStopModalVisible(false);

    if (isPinResetFlow) {
      navigateToMypage();
      return;
    }

    if (setupFlow === 'SIGNUP') {
      navigation?.navigate('Tutorial');
      return;
    }

    goBackOrMain();
  };

  const handlePressForgotPassword = () => {
    navigation?.replace('SmsVerification', { flow: 'PIN_RESET' });
  };

  const handlePressDelete = () => {
    if (isSubmitting || pinLockRemainingSeconds > 0) {
      return;
    }

    setPin((prev) => prev.slice(0, -1));
    setHasError(false);
    setSetupErrorMessage('');
  };

  const handleCompletePin = async (completedPin: string) => {
    if (mode === 'PAYMENT_INPUT') {
      if (!paymentParams || !idempotencyKey) {
        setPin('');
        setHasError(true);
        navigation?.replace('PaymentResult', {
          status: 'FAILURE',
          flow: paymentResultFlow,
          ...retryPaymentResultParams,
        });
        return;
      }

      try {
        setIsSubmitting(true);
        const requestCards = paymentParams.cards.length
          ? paymentParams.cards
          : [
              {
                cardId: paymentParams.cardId,
                amount: paymentParams.amount,
              },
            ];

        const paymentResponse = await requestPayment(
          {
            pin: completedPin,
            paymentId: paymentParams.paymentId,
            totalAmount: requestCards.reduce((sum, card) => sum + card.amount, 0),
            strategyType: paymentParams.strategyType,
            cards: requestCards,
          },
          idempotencyKey,
        );

        if (paymentParams.flow === 'REMOTE_PAYMENT') {
          completeRemoteRequest();
        }

        setPin('');
        setHasError(false);
        setSetupErrorMessage('');
        setPinLockedUntil(null);
        navigation?.replace('PaymentResult', {
          status: 'SUCCESS',
          flow: paymentResultFlow,
          paymentId: paymentResponse.paymentId ?? paymentParams.paymentId,
          dutchSessionId: paymentResponse.dutchSessionId ?? paymentParams.dutchSessionId,
          selectedUserIds: paymentParams.selectedUserIds,
          splitMethod: paymentParams.splitMethod,
          orderName: paymentParams.orderName,
          merchantId: paymentParams.merchantId,
        });
      } catch (error) {
        if (error instanceof PaymentRequestError && isPaymentPinError(error)) {
          const nextFailCount = error.details?.failCount ?? failCount + 1;
          const requiresSmsVerification =
            Boolean(error.details?.requireSmsVerification) || nextFailCount >= 10;
          const nextLockedUntil = getPaymentPinLockedUntil(error, nextFailCount);

          setPin('');
          setHasError(true);
          setFailCount(nextFailCount);
          setPinLockedUntil(nextLockedUntil);
          setSetupErrorMessage(
            getPaymentPinErrorMessage(
              error,
              nextFailCount,
              requiresSmsVerification,
              nextLockedUntil,
            ),
          );

          if (requiresSmsVerification) {
            setFailModalVisible(true);
          }

          return;
        }

        setPin('');
        setHasError(true);
        setFailCount((prev) => prev + 1);
        navigation?.replace('PaymentResult', {
          status: 'FAILURE',
          flow: paymentResultFlow,
          failureMessage:
            error instanceof Error
              ? error.message
              : '결제 요청에 실패했습니다. 다시 시도해주세요.',
          ...retryPaymentResultParams,
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
        setWeakPinModalVisible(true);
        return;
      }

      setPin('');
      setSetupErrorMessage('');
      navigation?.replace('PaymentPin', {
        mode: 'CONFIRM',
        firstPin: completedPin,
        flow: setupFlow,
        verificationId: routeParams?.mode === 'REGISTER'
          ? routeParams.verificationId
          : undefined,
      });
      return;
    }

    const firstPin = routeParams?.mode === 'CONFIRM' ? routeParams.firstPin : null;

    if (!firstPin) {
      navigation?.replace('PaymentPin', { mode: 'REGISTER' });
      return;
    }

    if (completedPin !== firstPin) {
      setPin('');
      setHasError(true);
      setSetupErrorMessage('비밀번호가 일치하지 않습니다.\n다시 입력해주세요.');
      setMismatchModalVisible(true);
      return;
    }

    try {
      setIsSubmitting(true);
      if (isPinResetFlow) {
        const verificationId =
          routeParams?.mode === 'CONFIRM' ? routeParams.verificationId : undefined;

        if (verificationId == null) {
          throw new Error('SMS 인증 정보가 없습니다. 다시 인증해주세요.');
        }

        await resetPin(verificationId, completedPin, firstPin);
        setSetupErrorMessage('');
        await disableBiometricPayment();

        setPendingBiometricPin(completedPin);
        setBiometricSetupNextScreen('MYPAGE_RESET');
        setBiometricSetupModalVisible(true);
        return;
      }

      await setupPin(completedPin, firstPin);
      setSetupErrorMessage('');

      setPendingBiometricPin(completedPin);
      setBiometricSetupNextScreen('SIGNUP_COMPLETE');
      setBiometricSetupModalVisible(true);
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

  const finishPinSetupAfterBiometric = () => {
    setPendingBiometricPin('');
    setBiometricSetupModalVisible(false);

    if (biometricSetupNextScreen === 'MYPAGE_RESET') {
      setResetCompleteModalVisible(true);
      return;
    }

    navigation?.replace('SignupComplete');
  };

  const handleConfirmBiometricSetup = () => {
    if (!pendingBiometricPin) {
      finishPinSetupAfterBiometric();
      return;
    }

    setIsSubmitting(true);
    enableBiometricPayment(pendingBiometricPin)
      .then(() => {
        setBiometricEnabled(true);
        finishPinSetupAfterBiometric();
      })
      .catch((error) => {
        setSetupErrorMessage(
          error instanceof Error ? error.message : '생체 인증 등록에 실패했습니다.',
        );
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleCancelBiometricSetup = () => {
    disableBiometricPayment().then(() => {
      setBiometricEnabled(false);
      finishPinSetupAfterBiometric();
    });
  };

  const handlePressBiometricPayment = async () => {
    if (mode !== 'PAYMENT_INPUT' || isSubmitting || pinLockRemainingSeconds > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSetupErrorMessage('');
      const biometricPin = await getBiometricPaymentPin();

      if (!biometricPin) {
        setBiometricEnabled(false);
        setSetupErrorMessage('생체 인증 정보를 찾을 수 없습니다.\nPIN으로 입력해주세요.');
        return;
      }

      await handleCompletePin(biometricPin);
    } catch {
      setSetupErrorMessage('생체 인증에 실패했습니다.\nPIN으로 입력해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (
      mode !== 'PAYMENT_INPUT'
      || !canUseBiometric
      || !biometricEnabled
      || hasTriedBiometric
      || isSubmitting
      || pinLockRemainingSeconds > 0
    ) {
      return;
    }

    setHasTriedBiometric(true);
    void handlePressBiometricPayment();
  }, [
    biometricEnabled,
    canUseBiometric,
    hasTriedBiometric,
    isSubmitting,
    mode,
    pinLockRemainingSeconds,
  ]);

  const handlePressNumber = (value: string) => {
    if (pin.length >= PIN_LENGTH || isSubmitting || pinLockRemainingSeconds > 0) {
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
              {pinLockRemainingSeconds > 0
                ? `비밀번호 입력이 잠겼습니다.\n${formatLockRemainingTime(pinLockRemainingSeconds)} 후 다시 시도해주세요.`
                : setupErrorMessage}
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
              className="mt-12 flex-row items-center rounded-lg border border-[#FF6B35] bg-[#FFFBEA] px-4 py-3 shadow-sm"
              onPress={handlePressForgotPassword}
              onLongPress={__DEV__ ? handleMockError : undefined}
            >
              <View className="mr-3 h-7 w-7 items-center justify-center rounded-full bg-[#FF6B35]">
                <Feather name="alert-circle" size={18} color="#FFFFFF" />
              </View>
              <View className="min-w-0">
                <Text className="font-pretendard text-normal-bold text-neutral-black1">
                  간편비밀번호를 잊으셨나요?
                </Text>
                <Text className="mt-1 font-pretendard text-normal-bold text-neutral-black2">
                  마이페이지에서 재설정할 수 있어요.
                </Text>
              </View>
            </Pressable>
          ) : null}
        </View>

        <PinCodeKeypad
          onPressNumber={isSubmitting ? () => {} : handlePressNumber}
          onPressDelete={isSubmitting ? () => {} : handlePressDelete}
          disabled={isSubmitting || pinLockRemainingSeconds > 0}
          leftAction={
            mode === 'PAYMENT_INPUT' && canUseBiometric && biometricEnabled ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="생체 인증"
                disabled={pinLockRemainingSeconds > 0}
                className={`flex-1 items-center justify-center rounded-xl shadow-sm ${
                  pinLockRemainingSeconds > 0 ? 'bg-neutral-grey1' : 'bg-neutral-white'
                }`}
                onPress={handlePressBiometricPayment}
              >
                <Feather
                  name="smile"
                  size={24}
                  color={pinLockRemainingSeconds > 0 ? '#B4B8BD' : '#2FAB84'}
                />
                <Text
                  className={`mt-1 font-pretendard text-small-bold ${
                    pinLockRemainingSeconds > 0
                      ? 'text-neutral-disabled'
                      : 'text-erum-main'
                  }`}
                >
                  생체
                </Text>
              </Pressable>
            ) : null
          }
        />

        {isPinResetFlow ? (
          <Modal
            visible={stopModalVisible}
            type="two"
            icon={
              <View className="h-14 w-14 items-center justify-center rounded-full bg-[#FF9500]">
                <Feather name="alert-triangle" size={30} color="#FFFFFF" />
              </View>
            }
            title="간편비밀번호 재설정을 중지하시겠습니까?"
            description="중지하면 기존 간편비밀번호가 유지됩니다."
            confirmLabel="예"
            cancelLabel="아니오"
            onConfirm={handleConfirmStopFlow}
            onCancel={() => setStopModalVisible(false)}
            onClose={() => setStopModalVisible(false)}
          />
        ) : setupFlow === 'SIGNUP' ? (
          <Modal
            visible={stopModalVisible}
            type="two"
            icon={
              <View className="h-14 w-14 items-center justify-center rounded-full bg-[#FF9500]">
                <Feather name="alert-triangle" size={30} color="#FFFFFF" />
              </View>
            }
            title="회원가입을 중지하시겠습니까?"
            description="종료 시 카카오톡 인증부터 다시 시작합니다."
            confirmLabel="예"
            cancelLabel="아니오"
            onConfirm={handleConfirmStopFlow}
            onCancel={() => setStopModalVisible(false)}
            onClose={() => setStopModalVisible(false)}
          />
        ) : (
          <PaymentStopConfirmModal
            visible={stopModalVisible}
            description={
              paymentParams?.flow === 'DUTCH_PAY'
              || paymentParams?.flow === 'REMOTE_PAYMENT'
                ? '중지하셔도 메인에서 결제 진행상태를 확인할 수 있습니다.'
                : undefined
            }
            onConfirm={handleConfirmStopFlow}
            onCancel={() => setStopModalVisible(false)}
          />
        )}

        {isSubmitting ? (
          <Loading
            overlay
            message={
              mode === 'PAYMENT_INPUT'
                ? '결제를 처리하는 중입니다.'
                : isPinResetFlow
                  ? 'PIN을 재설정하는 중입니다.'
                  : 'PIN을 등록하는 중입니다.'
            }
          />
        ) : null}

      </View>

      <Modal
        visible={biometricSetupModalVisible}
        type="two"
        icon={
          <View className="h-14 w-14 items-center justify-center rounded-full bg-erum-main">
            <Feather name="shield" size={30} color="#FFFFFF" />
          </View>
        }
        title="생체 인증을 사용할까요?"
        description="다음 결제부터 Face ID 또는 Touch ID로 간편비밀번호 입력을 대신할 수 있습니다."
        confirmLabel="사용하기"
        cancelLabel="나중에"
        onConfirm={handleConfirmBiometricSetup}
        onCancel={handleCancelBiometricSetup}
        onClose={handleCancelBiometricSetup}
      />

      <Modal
        visible={resetCompleteModalVisible}
        type="one"
        icon={
          <View className="h-14 w-14 items-center justify-center rounded-full bg-erum-main">
            <Feather name="check" size={32} color="#FFFFFF" />
          </View>
        }
        title="간편비밀번호 재설정이 완료되었습니다."
        confirmLabel="확인"
        onConfirm={() => {
          setResetCompleteModalVisible(false);
          navigateToMypage();
        }}
        onClose={() => {
          setResetCompleteModalVisible(false);
          navigateToMypage();
        }}
      />

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
          navigation?.replace('SmsVerification', { flow: 'PIN_RESET' });
        }}
        onClose={() => {
          setFailModalVisible(false);
          navigation?.replace('SmsVerification', { flow: 'PIN_RESET' });
        }}
      />

      {/* 쉬운 번호 경고 모달 */}
      <Modal
        visible={weakPinModalVisible}
        type="one"
        icon={
          <View className="h-14 w-14 items-center justify-center rounded-full bg-[#FF9500]">
            <Feather name="alert-triangle" size={30} color="#FFFFFF" />
          </View>
        }
        title="안전한 사용을 위해 쉬운 번호는 피해 주세요."
        confirmLabel="확인"
        onConfirm={() => setWeakPinModalVisible(false)}
        onClose={() => setWeakPinModalVisible(false)}
      />

      {/* 비밀번호 불일치 모달 */}
      <Modal
        visible={mismatchModalVisible}
        type="one"
        icon={
          <View className="h-14 w-14 items-center justify-center rounded-full bg-state-error">
            <Feather name="x" size={30} color="#FFFFFF" />
          </View>
        }
        title="비밀번호가 일치하지 않습니다."
        description="다시 입력해주세요."
        confirmLabel="확인"
        onConfirm={() => setMismatchModalVisible(false)}
        onClose={() => setMismatchModalVisible(false)}
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
  return (
    error.code === 'PIN_INVALID' ||
    error.code === 'PIN_VERIFY_FAILED' ||
    error.code === 'PIN_LOCKED' ||
    error.code === 'PIN_RESET_REQUIRED'
  );
}

function getPaymentPinErrorMessage(
  error: PaymentRequestError,
  failCount: number,
  requiresSmsVerification = false,
  lockedUntil: number | null = null,
) {
  if (requiresSmsVerification) {
    return '10회 이상 실패했습니다.\nSMS 재인증 후 PIN을 다시 설정해주세요.';
  }

  if (lockedUntil) {
    return '비밀번호 입력이 잠겼습니다.\n5:00 후 다시 시도해주세요.';
  }

  if (error.code === 'PIN_INVALID' || error.code === 'PIN_VERIFY_FAILED') {
    const remainCount = error.details?.remainCount;

    if (typeof remainCount === 'number') {
      return `비밀번호가 일치하지 않습니다.\n다시 입력해주세요 (${failCount}회, 남은 ${remainCount}회)`;
    }

    if (failCount === 5) {
      return `비밀번호가 일치하지 않습니다.\n${failCount}회 실패하여 5분 후 다시 시도해주세요.`;
    }

    return `비밀번호가 일치하지 않습니다.\n다시 입력해주세요 (${failCount}회)`;
  }

  return error.message || '결제 비밀번호 확인에 실패했습니다.';
}

function getPaymentPinLockedUntil(
  error: PaymentRequestError,
  failCount: number,
) {
  if (failCount >= 10 || error.code === 'PIN_RESET_REQUIRED') {
    return null;
  }

  if (error.details?.lockedUntil) {
    const lockedUntil = new Date(error.details.lockedUntil).getTime();

    if (Number.isFinite(lockedUntil) && lockedUntil > Date.now()) {
      return lockedUntil;
    }
  }

  if (error.code === 'PIN_LOCKED' || failCount === 5) {
    return Date.now() + PIN_LOCK_DURATION_SECONDS * 1000;
  }

  return null;
}

function formatLockRemainingTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
