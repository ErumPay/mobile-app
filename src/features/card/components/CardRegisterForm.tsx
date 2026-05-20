import { Pressable, Text, TextInput, View } from 'react-native';

import type { CardRegisterFormValues } from '../types/card';
import { formatExpiry, onlyDigits } from '../types/cardFormat';
import { CardNumberInput } from './CardNumberInput';
import { CardPreview } from './CardPreview';

interface CardRegisterFormProps {
  canSubmit: boolean;
  values: CardRegisterFormValues;
  onChange: <Key extends keyof CardRegisterFormValues>(
    key: Key,
    value: CardRegisterFormValues[Key],
  ) => void;
  onSubmit: () => void;
}

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
    <View className="gap-6">
      <CardPreview
        cardNumber={values.cardNumber}
        cardCompany="카드사"
        cardName={values.cardNickname || '카드명'}
      />

      <View className="gap-4">
        <CardNumberInput
          value={values.cardNumber}
          onChangeText={(value) => onChange('cardNumber', onlyDigits(value))}
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="mb-2 text-sm font-semibold text-zinc-800">
              유효기간
            </Text>
            <TextInput
              className="rounded-xl border border-zinc-200 bg-white px-4 py-4 text-base font-semibold text-zinc-950"
              keyboardType="number-pad"
              maxLength={5}
              placeholder="MM/YY"
              placeholderTextColor="#a1a1aa"
              value={values.expiry}
              onChangeText={(value) => onChange('expiry', formatExpiry(value))}
            />
          </View>

          <View className="flex-1">
            <Text className="mb-2 text-sm font-semibold text-zinc-800">CVC</Text>
            <TextInput
              className="rounded-xl border border-zinc-200 bg-white px-4 py-4 text-base font-semibold text-zinc-950"
              keyboardType="number-pad"
              maxLength={3}
              placeholder="000"
              placeholderTextColor="#a1a1aa"
              secureTextEntry
              value={values.cvc}
              onChangeText={(value) => onChange('cvc', onlyDigits(value))}
            />
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="mb-2 text-sm font-semibold text-zinc-800">
              비밀번호 앞 2자리
            </Text>
            <TextInput
              className="rounded-xl border border-zinc-200 bg-white px-4 py-4 text-base font-semibold text-zinc-950"
              keyboardType="number-pad"
              maxLength={2}
              placeholder="00"
              placeholderTextColor="#a1a1aa"
              secureTextEntry
              value={values.passwordFirstTwo}
              onChangeText={(value) =>
                onChange('passwordFirstTwo', onlyDigits(value))
              }
            />
          </View>

          <View className="flex-1">
            <Text className="mb-2 text-sm font-semibold text-zinc-800">
              생년월일 6자리
            </Text>
            <TextInput
              className="rounded-xl border border-zinc-200 bg-white px-4 py-4 text-base font-semibold text-zinc-950"
              keyboardType="number-pad"
              maxLength={6}
              placeholder="YYMMDD"
              placeholderTextColor="#a1a1aa"
              value={values.birthDate}
              onChangeText={(value) => onChange('birthDate', onlyDigits(value))}
            />
          </View>
        </View>

        <View>
          <Text className="mb-2 text-sm font-semibold text-zinc-800">
            카드별칭(선택)
          </Text>
          <TextInput
            className="rounded-xl border border-zinc-200 bg-white px-4 py-4 text-base text-zinc-950"
            placeholder="생활비 카드"
            placeholderTextColor="#a1a1aa"
            value={values.cardNickname}
            onChangeText={(value) => onChange('cardNickname', value)}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          className={`h-14 items-center justify-center rounded-xl ${
            canSubmit ? 'bg-emerald-500' : 'bg-zinc-300'
          }`}
          disabled={!canSubmit}
          onPress={handleSubmit}
        >
          <Text className="text-base font-semibold text-white">등록하기</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default CardRegisterForm;
