import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Header } from '../../../shared/components/Header';
import { NoticeBox } from '../../../shared/components/NoticeBox';
import { PageWrap } from '../../../shared/components/PageWrap';
import { CardOcrMock } from '../components/CardOcrMock';
import { CardRegisterForm } from '../components/CardRegisterForm';
import { CardRegisterResult } from '../components/CardRegisterResult';
import {
  initialCardRegisterFormValues,
  mockRegisteredCard,
} from '../mocks/cardMockData';
import type { CardRegisterFormValues, RegisteredCard } from '../types/card';
import { onlyDigits } from '../types/cardFormat';

type RegisterMode = 'select' | 'ocr' | 'manual' | 'success' | 'failure';

interface CardManualRegisterScreenProps {
  onClose?: () => void;
  onOcrRegister?: () => void;
  onCardRegistered?: (card: RegisteredCard) => void;
}

function isCardRegisterFormReady(values: CardRegisterFormValues): boolean {
  return (
    onlyDigits(values.cardNumber).length === 16 &&
    isValidExpiry(values.expiry) &&
    onlyDigits(values.cvc).length === 3 &&
    onlyDigits(values.passwordFirstTwo).length === 2 &&
    onlyDigits(values.birthDate).length === 6
  );
}

function isValidExpiry(expiry: string): boolean {
  return /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry);
}

export function CardManualRegisterScreen({
  onClose,
  onOcrRegister,
  onCardRegistered,
}: CardManualRegisterScreenProps) {
  const [mode, setMode] = useState<RegisterMode>('select');
  const [formValues, setFormValues] =
    useState<CardRegisterFormValues>(initialCardRegisterFormValues);

  const canSubmitManualCard = isCardRegisterFormReady(formValues);

  const handlePressOcrRegister = () => {
    if (onOcrRegister) {
      onOcrRegister();
      return;
    }

    setMode('ocr');
  };

  const handleChangeFormValue = <Key extends keyof CardRegisterFormValues>(
    key: Key,
    value: CardRegisterFormValues[Key],
  ) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  };

  const handleSubmitManualCard = () => {
    const digits = onlyDigits(formValues.cardNumber);

    onCardRegistered?.({
      ...mockRegisteredCard,
      id: `card-${Date.now()}`,
      last4: digits.slice(-4),
      cardNickname: formValues.cardNickname || mockRegisteredCard.cardNickname,
    });

    setMode('success');
  };

  const handleGoCardManagement = () => {
    // TODO: 카드 관리 화면으로 이동
  };

  const handleGoHome = () => {
    onClose?.();
  };

  return (
    <PageWrap
      scroll={mode !== 'ocr'}
      padded={mode !== 'ocr'}
      backgroundClassName={mode === 'ocr' ? 'bg-black' : 'bg-neutral-grey2'}
      header={
        mode !== 'ocr' ? (
          <Header title="카드등록" type="close" onPressRight={onClose} />
        ) : undefined
      }
    >
      {mode === 'select' ? (
        <View className="w-full gap-6">
          <Text className="font-pretendard text-heading-2 text-neutral-black1">
            카드 등록 방법을 선택해주세요.
          </Text>

          <View className="gap-4">
            <RegisterMethodCard
              tone="blue"
              title="OCR로 등록하기"
              description="카드를 촬영해주세요"
              onPress={handlePressOcrRegister}
            />

            <RegisterMethodCard
              tone="green"
              title="직접 입력하기"
              description="카드 정보를 직접 입력해주세요"
              onPress={() => setMode('manual')}
            />
          </View>

          <NoticeBox
            tone="info"
            description="💳 카드 등록 시 카드사 확인 절차가 진행됩니다. 본인 명의의 카드만 등록 가능합니다."
          />
        </View>
      ) : mode === 'ocr' ? (
        <CardOcrMock
          onClose={onClose}
          onRegister={() => setMode('success')}
          onChangeManual={() => setMode('manual')}
        />
      ) : mode === 'manual' ? (
        <View className="w-full">
          <CardRegisterForm
            canSubmit={canSubmitManualCard}
            values={formValues}
            onChange={handleChangeFormValue}
            onSubmit={handleSubmitManualCard}
          />
        </View>
      ) : mode === 'success' ? (
        <CardRegisterResult
          status="success"
          onGoCardManagement={handleGoCardManagement}
          onGoHome={handleGoHome}
        />
      ) : (
        <CardRegisterResult
          status="failure"
          onRetry={() => setMode('manual')}
          onGoHome={handleGoHome}
        />
      )}
    </PageWrap>
  );
}

function RegisterMethodCard({
  tone,
  title,
  description,
  onPress,
}: {
  tone: 'blue' | 'green';
  title: string;
  description: string;
  onPress: () => void;
}) {
  const isBlue = tone === 'blue';
  const borderClassName = isBlue ? 'border-blue-700' : 'border-erum-secondary';
  const iconClassName = isBlue ? 'bg-blue-700' : 'bg-erum-secondary';

  return (
    <Pressable
      accessibilityRole="button"
      className={`w-full items-center justify-center rounded-2xl border-2 bg-neutral-white px-5 py-6 ${borderClassName}`}
      onPress={onPress}
    >
      <View
        className={`mb-5 h-16 w-16 items-center justify-center rounded-full ${iconClassName}`}
      >
        {isBlue ? <CameraIcon /> : <PencilIcon />}
      </View>

      <Text className="font-pretendard text-heading-2 text-neutral-black1">
        {title}
      </Text>

      <Text className="mt-3 text-center font-pretendard text-heading-3 text-neutral-black2">
        {description}
      </Text>
    </Pressable>
  );
}

function CameraIcon() {
  return (
    <Svg width={46} height={40} viewBox="0 0 46 40" fill="none">
      <Rect
        x={7}
        y={13}
        width={32}
        height={22}
        rx={3}
        stroke="white"
        strokeWidth={3.5}
      />
      <Circle cx={23} cy={24} r={6} stroke="white" strokeWidth={3.5} />
      <Path
        d="M16 13L20 8H26L30 13"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3.5}
      />
    </Svg>
  );
}

function PencilIcon() {
  return (
    <Svg width={46} height={46} viewBox="0 0 46 46" fill="none">
      <Path
        d="M31 8L38 15L18 35L9 37L11 28L31 8Z"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={4}
      />
      <Path
        d="M28 12L35 19"
        stroke="white"
        strokeLinecap="round"
        strokeWidth={4}
      />
      <Path
        d="M18 37H36"
        stroke="white"
        strokeLinecap="round"
        strokeWidth={4}
      />
    </Svg>
  );
}

export default CardManualRegisterScreen;