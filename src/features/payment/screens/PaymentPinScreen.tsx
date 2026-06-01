import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../../App';
import { Header } from '../../../shared/components/Header';
import { NoticeBox } from '../../../shared/components/NoticeBox';
import PageWrap from '../../../shared/components/PageWrap';
import { PinCodeDots, PinCodeKeypad } from '../../../shared/components/PinCode';
import type { PaymentPinMode } from '../types/paymentPin.types';

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

  const [pin, setPin] = useState('');
  const [hasError, setHasError] = useState(false);
  const [failCount, setFailCount] = useState(0);

  const handlePressClose = () => {
    navigation.goBack();
  };

  const handlePressForgotPassword = () => {
    Alert.alert('간편비밀번호', '간편비밀번호 재설정 화면으로 이동합니다.');
  };

  const handlePressDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setHasError(false);
  };

  const handleCompletePin = () => {
    if (mode === 'PAYMENT_INPUT') {
      Alert.alert('간편비밀번호', '결제를 진행합니다.');
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
    if (pin.length >= PIN_LENGTH) {
      return;
    }

    const nextPin = `${pin}${value}`;

    setPin(nextPin);
    setHasError(false);

    if (nextPin.length === PIN_LENGTH) {
      handleCompletePin();
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
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
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

            {screenText.showWarning ? (
              <View className="mt-12 w-full">
                <NoticeBox
                  tone="warning"
                  description="추측하기 쉬운 연속숫자, 동일숫자 설정은 피하세요."
                />
              </View>
            ) : null}

            {screenText.showForgotLink ? (
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
            onPressNumber={handlePressNumber}
            onPressDelete={handlePressDelete}
          />
        </View>
      </ScrollView>
    </PageWrap>
  );
}
