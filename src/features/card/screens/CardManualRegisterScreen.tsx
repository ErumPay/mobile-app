// 화면 안에서 선택 모드와 입력값 상태를 관리하기 위해 React의 useState를 가져옵니다.
import { useState } from 'react';
// React Native 기본 화면 구성 요소입니다. 버튼, 안전 영역, 스크롤, 텍스트, 레이아웃을 만들 때 사용합니다.
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

// 직접 입력 모드에서 실제 카드 정보 입력 폼을 보여주기 위해 사용합니다.
import { CardRegisterForm } from '../components/CardRegisterForm';
import { CardRegisterResult } from '../components/CardRegisterResult';
// 카드등록 폼 값의 타입과 등록 완료 카드 타입을 지정해 TypeScript가 props와 상태를 검사하게 합니다.
import type { CardRegisterFormValues, RegisteredCard } from '../types/card';
// 입력값에서 숫자만 남겨 카드번호, CVC, 생년월일 길이를 검증하기 위해 사용합니다.
import { onlyDigits } from '../types/cardFormat';

// 카드등록 화면은 방식 선택, 직접 입력, 등록 결과 모드로 동작합니다.
type RegisterMode = 'select' | 'manual' | 'success' | 'failure';

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
  // 등록 버튼 활성화 여부를 판단하는 함수입니다.
  // 카드별칭은 선택값이므로 필수 검증에서 제외합니다.
  return (
    onlyDigits(values.cardNumber).length === 16 &&
    // 유효기간은 단순 입력 여부가 아니라 MM/YY 형식과 월 범위까지 확인합니다.
    isValidExpiry(values.expiry) &&
    onlyDigits(values.cvc).length === 3 &&
    onlyDigits(values.passwordFirstTwo).length === 2 &&
    onlyDigits(values.birthDate).length === 6
  );
}

function isValidExpiry(expiry: string): boolean {
  // ^와 $는 문자열 전체가 이 형식과 정확히 일치해야 한다는 뜻입니다.
  // (0[1-9]|1[0-2])는 01~09 또는 10~12만 허용하므로 00과 13은 실패합니다.
  // / 뒤의 \d{2}는 연도 두 자리만 허용하므로 12/25는 통과하고 1225는 실패합니다.
  const expiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;

  return expiryPattern.test(expiry);
}

export function CardManualRegisterScreen({
  onClose,
  onOcrRegister,
}: CardManualRegisterScreenProps) {
  // 현재 화면이 등록 방식 선택 화면인지, 직접 입력 화면인지 저장합니다.
  const [mode, setMode] = useState<RegisterMode>('select');
  // 카드등록 폼에 입력되는 모든 값을 상위 화면에서 한 번에 관리합니다.
  const [formValues, setFormValues] =
    useState<CardRegisterFormValues>(initialFormValues);
  const canSubmitManualCard = isCardRegisterFormReady(formValues);

  const handlePressOcrRegister = () => {
    if (onOcrRegister) {
      onOcrRegister();
      return;
    }

    setMode('manual');
  };

  const handlePressManualRegister = () => {
    setMode('manual');
  };

  // Key는 CardRegisterFormValues의 키 중 하나만 받을 수 있게 제한하는 제네릭입니다.
  // 예를 들어 key가 'cvc'라면 value도 cvc 필드 타입인 string으로 맞춰집니다.
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
    // 실패 화면 확인이 필요하면 아래 줄로 임시 전환할 수 있습니다.
    // setMode('failure');
  };

  const handleGoCardManagement = () => {
    // TODO: 카드 관리 화면으로 이동
  };

  const handleGoHome = () => {
    // TODO: 홈 화면으로 이동
    onClose?.();
  };

  // SafeAreaView는 휴대폰 상단 노치와 하단 영역을 피해 안전하게 화면을 배치합니다.
  return (
    <SafeAreaView className="flex-1 bg-zinc-50">
      {/* 전체 화면이 작아도 내용을 스크롤해서 볼 수 있게 감쌉니다. */}
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
      >
        {/* 화면 전체 여백을 담당하는 최상위 콘텐츠 영역입니다. */}
        <View className="px-5 pb-10 pt-6">
          {/* 상단 헤더 영역입니다. 가운데에는 제목, 오른쪽에는 닫기 버튼을 둡니다. */}
          <View className="mb-8 flex-row items-center justify-between">
            <View className="h-10 w-10" />

            <Text className="text-xl font-bold text-zinc-950">카드등록</Text>

            <Pressable
              accessibilityRole="button"
              className="h-10 w-10 items-center justify-center rounded-full"
              onPress={mode === 'manual' ? () => setMode('select') : onClose}
            >
              <Text className="text-2xl font-light text-zinc-950">
                {mode === 'manual' ? '<' : 'X'}
              </Text>
            </Pressable>
          </View>

          {mode === 'select' ? (
            <View className="gap-5">
              <Text className="text-2xl font-bold leading-8 text-zinc-950">
                카드를 어떤 방식으로 등록할까요?
              </Text>

              {/* OCR 등록과 직접 입력 등록을 큰 카드 버튼으로 보여주는 영역입니다. */}
              <View className="gap-4">
                <Pressable
                  accessibilityRole="button"
                  className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm"
                  onPress={handlePressOcrRegister}
                >
                  <View className="mb-5 h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                    <Text className="text-2xl text-blue-500">+</Text>
                  </View>
                  <View className="flex-row items-end justify-between">
                    <View className="flex-1 pr-5">
                      <Text className="text-xl font-bold text-zinc-950">
                        OCR로 등록하기
                      </Text>
                      <Text className="mt-2 text-sm leading-5 text-zinc-500">
                        카드를 촬영해서 카드번호와 유효기간을 빠르게 입력합니다.
                      </Text>
                    </View>
                    <Text className="text-2xl text-zinc-300">&gt;</Text>
                  </View>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm"
                  onPress={handlePressManualRegister}
                >
                  <View className="mb-5 h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
                    <Text className="text-2xl text-emerald-500">#</Text>
                  </View>
                  <View className="flex-row items-end justify-between">
                    <View className="flex-1 pr-5">
                      <Text className="text-xl font-bold text-zinc-950">
                        직접 입력하기
                      </Text>
                      <Text className="mt-2 text-sm leading-5 text-zinc-500">
                        카드번호, 유효기간, CVC 등 정보를 직접 입력합니다.
                      </Text>
                    </View>
                    <Text className="text-2xl text-zinc-300">&gt;</Text>
                  </View>
                </Pressable>
              </View>

              {/* 카드 정보 사용 목적을 설명하는 안내 박스입니다. */}
              <View className="rounded-2xl bg-blue-50 px-5 py-4">
                <Text className="text-sm font-bold text-blue-900">안내</Text>
                <Text className="mt-2 text-sm leading-5 text-blue-700">
                  카드 정보는 안전한 결제 수단 등록을 위해서만 사용됩니다. OCR
                  등록은 추후 연결될 예정입니다.
                </Text>
              </View>
            </View>
          ) : mode === 'manual' ? (
            <View>
              <Text className="mb-5 text-sm leading-5 text-zinc-500">
                카드 정보를 직접 입력해 주세요.
              </Text>
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default CardManualRegisterScreen;
