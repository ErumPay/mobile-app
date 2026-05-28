import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useWindowDimensions } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { CardMobileLayout } from '../components/CardMobileLayout';
import { CardOcrMock } from '../components/CardOcrMock';
import { CardRegisterForm } from '../components/CardRegisterForm';
import { CardRegisterResult } from '../components/CardRegisterResult';
import type { CardRegisterFormValues, RegisteredCard } from '../types/card';
import { onlyDigits } from '../types/cardFormat';

type RegisterMode = 'select' | 'ocr' | 'manual' | 'success' | 'failure';

interface CardManualRegisterScreenProps {
  onClose?: () => void;
  onOcrRegister?: () => void;
  onCardRegistered?: (card: RegisteredCard) => void;
}

const initialFormValues: CardRegisterFormValues = {
  cardNumber: '',
  expiry: '',
  cvc: '',
  passwordFirstTwo: '',
  birthDate: '',
  cardNickname: '',
};

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

function ScreenHeader({ onClose }: { onClose?: () => void }) {
  const { width } = useWindowDimensions();

  return (
    <View
      style={{
        marginHorizontal: -16,
        marginTop: -24,
        paddingHorizontal: 16,
        width: width,
      }}
      className="flex-row items-center justify-between bg-white py-3 mb-2"
    >
      <Text className="text-lg font-bold text-zinc-950">카드등록</Text>
      <Pressable
        accessibilityRole="button"
        className="h-8 w-8 items-center justify-center"
        onPress={onClose}
      >
        <Text className="text-2xl font-light text-zinc-950">×</Text>
      </Pressable>
    </View>
  );
}

export function CardManualRegisterScreen({
  onClose,
  onOcrRegister,
}: CardManualRegisterScreenProps) {
  const [mode, setMode] = useState<RegisterMode>('select');
  const [formValues, setFormValues] =
    useState<CardRegisterFormValues>(initialFormValues);
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
    setMode('success');
  };

  const handleGoCardManagement = () => {
    // TODO: 카드 관리 화면으로 이동
  };

  const handleGoHome = () => {
    // TODO: 홈 화면으로 이동
    onClose?.();
  };

  return (
    <CardMobileLayout isDark={mode === 'ocr'}>
      {mode !== 'ocr' ? <ScreenHeader onClose={onClose} /> : null}
      {mode === 'select' ? (
        <View className="w-full">
          <Text className="mb-5 text-xl font-bold text-zinc-950">
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

          <View className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-4">
            <Text className="text-sm leading-6 text-blue-900">
              💳 카드 등록 시 카드사 확인 절차가 진행됩니다.
            </Text>
            <Text className="text-sm leading-6 text-blue-900">
              본인 명의의 카드만 등록 가능합니다.
            </Text>
          </View>
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
    </CardMobileLayout>
  );
}

function CameraIcon() {
  return (
    <Svg width={36} height={32} viewBox="0 0 36 32" fill="none">
      {/* 카메라 본체 */}
      <Rect x={1} y={8} width={34} height={23} rx={3} stroke="white" strokeWidth={2.5} />
      {/* 렌즈 원 */}
      <Circle cx={18} cy={20} r={7} stroke="white" strokeWidth={2.5} />
      {/* 뷰파인더 돌출부 */}
      <Path
        d="M12 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"
        stroke="white"
        strokeWidth={2.5}
      />
      {/* 플래시 작은 사각형 */}
      <Rect x={27} y={12} width={4} height={3} rx={1} fill="white" />
    </Svg>
  );
}

function PencilIcon() {
  return (
    <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
      <Path
        d="M22 4l6 6L10 28H4v-6L22 4z"
        stroke="white"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <Path d="M19 7l6 6" stroke="white" strokeWidth={2.5} />
    </Svg>
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
  const borderClassName = isBlue ? 'border-blue-700' : 'border-emerald-700';
  const iconClassName = isBlue ? 'bg-blue-700' : 'bg-emerald-700';

  return (
    <Pressable
      accessibilityRole="button"
      className={`h-[160px] w-full items-center justify-center rounded-xl border bg-white px-5 ${borderClassName}`}
      onPress={onPress}
    >
      <View
        className={`mb-4 h-20 w-20 items-center justify-center rounded-full ${iconClassName}`}
      >
        {isBlue ? <CameraIcon /> : <PencilIcon />}
      </View>
      <Text className="text-lg font-bold text-zinc-950">{title}</Text>
      <Text className="mt-1 text-center text-sm text-zinc-500">{description}</Text>
    </Pressable>
  );
}

export default CardManualRegisterScreen;