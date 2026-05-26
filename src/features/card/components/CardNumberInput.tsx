import { Text, TextInput, View } from 'react-native';

import { onlyDigits } from '../types/cardFormat';

interface CardNumberInputProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}

export function CardNumberInput({
  value,
  onChangeText,
  placeholder = '카드번호를 입력해주세요.',
}: CardNumberInputProps) {
  const formattedValue = onlyDigits(value)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1-');

  const handleChangeText = (text: string) => {
    onChangeText(onlyDigits(text).slice(0, 16));
  };

  return (
    <View className="w-full">
      <Text className="mb-2 text-base font-bold text-zinc-950">
        카드번호 <Text className="text-red-500">*</Text>
      </Text>
      <TextInput
        className="min-h-[46px] w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-950"
        keyboardType="number-pad"
        maxLength={19}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        textContentType="creditCardNumber"
        value={formattedValue}
        onChangeText={handleChangeText}
      />
    </View>
  );
}

export default CardNumberInput;
