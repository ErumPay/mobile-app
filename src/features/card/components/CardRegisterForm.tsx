import { Pressable, Text, TextInput, View } from 'react-native';

import type { CardRegisterFormValues } from '../types/card';
import { formatExpiry, onlyDigits } from '../types/cardFormat';
import { CardNumberInput } from './CardNumberInput';

interface CardRegisterFormProps {
  canSubmit: boolean;
  values: CardRegisterFormValues;
  onChange: <Key extends keyof CardRegisterFormValues>(
    key: Key,
    value: CardRegisterFormValues[Key],
  ) => void;
  onSubmit: () => void;
}

function RequiredLabel({ children }: { children: string }) {
  return (
    <Text
      numberOfLines={1}
      className="mb-2 w-full min-w-0 text-base font-bold text-zinc-950"
    >
      {children} <Text className="text-red-500">*</Text>
    </Text>
  );
}

const inputClassName =
  'min-h-[46px] w-full min-w-0 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-950';

export function CardRegisterForm({
  canSubmit,
  values,
  onChange,
  onSubmit,
}: CardRegisterFormProps) {
  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    onSubmit();
  };

  return (
    <View className="w-full min-w-0 gap-4 overflow-hidden">
      <View className="mb-5 w-full min-w-0 overflow-hidden rounded-lg border border-blue-100 bg-blue-50 px-4 py-4">
        <Text
          numberOfLines={2}
          className="w-full min-w-0 text-sm font-medium leading-5 text-blue-800"
        >
          🔒 입력하신 정보는 안전하게 암호화되어 저장됩니다.
        </Text>
      </View>

      <View className="w-full min-w-0">
        <CardNumberInput
          value={values.cardNumber}
          placeholder="카드번호를 입력해주세요."
          onChangeText={(value) => onChange('cardNumber', onlyDigits(value))}
        />
      </View>

      <View className="w-full min-w-0 flex-row gap-3 overflow-hidden">
        <View className="min-w-0 flex-1 overflow-hidden">
          <RequiredLabel>유효기간</RequiredLabel>
          <TextInput
            className={inputClassName}
            keyboardType="number-pad"
            maxLength={5}
            placeholder="MM/YY"
            placeholderTextColor="#9ca3af"
            value={values.expiry}
            onChangeText={(value) => onChange('expiry', formatExpiry(value))}
          />
        </View>

        <View className="min-w-0 flex-1 overflow-hidden">
          <RequiredLabel>CVC</RequiredLabel>
          <TextInput
            className={inputClassName}
            keyboardType="number-pad"
            maxLength={3}
            placeholder="123"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            value={values.cvc}
            onChangeText={(value) => onChange('cvc', onlyDigits(value))}
          />
        </View>
      </View>

      <View className="w-full min-w-0 overflow-hidden">
        <RequiredLabel>비밀번호 앞 2자리</RequiredLabel>
        <TextInput
          className={inputClassName}
          keyboardType="number-pad"
          maxLength={2}
          placeholder="**"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          value={values.passwordFirstTwo}
          onChangeText={(value) =>
            onChange('passwordFirstTwo', onlyDigits(value))
          }
        />
      </View>

      <View className="w-full min-w-0 overflow-hidden">
        <RequiredLabel>생년월일 (6자리)</RequiredLabel>
        <TextInput
          className={inputClassName}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="930315"
          placeholderTextColor="#9ca3af"
          value={values.birthDate}
          onChangeText={(value) => onChange('birthDate', onlyDigits(value))}
        />
        <Text
          numberOfLines={1}
          className="mt-2 w-full min-w-0 text-xs text-slate-500"
        >
          예: 1993년 3월 15일 → 930315
        </Text>
      </View>

      <View className="w-full min-w-0 overflow-hidden">
        <Text
          numberOfLines={1}
          className="mb-2 w-full min-w-0 text-base font-bold text-zinc-950"
        >
          카드별칭 (선택)
        </Text>
        <TextInput
          className={inputClassName}
          placeholder="카드 별칭을 작성해주세요."
          placeholderTextColor="#9ca3af"
          value={values.cardNickname}
          onChangeText={(value) => onChange('cardNickname', value)}
        />
      </View>

      <View className="mt-1 h-px w-full bg-zinc-200" />

      <Pressable
        accessibilityRole="button"
        className={`min-h-[45px] w-full min-w-0 items-center justify-center rounded-lg px-4 py-3 ${
          canSubmit ? 'bg-emerald-700' : 'bg-zinc-300'
        }`}
        disabled={!canSubmit}
        onPress={handleSubmit}
      >
        <Text numberOfLines={1} className="text-base font-bold text-white">
          카드 등록하기
        </Text>
      </Pressable>
    </View>
  );
}

export default CardRegisterForm;