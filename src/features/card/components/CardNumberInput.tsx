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
  placeholder = '0000-0000-0000-0000',
}: CardNumberInputProps) {
  const formattedValue = onlyDigits(value)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1-');

  const handleChangeText = (text: string) => {
    onChangeText(onlyDigits(text).slice(0, 16));
  };

  return (
    <View>
      <Text className="mb-2 text-sm font-semibold text-zinc-800">
        카드번호
      </Text>
      <TextInput
        className="rounded-xl border border-zinc-200 bg-white px-4 py-4 text-lg font-semibold tracking-widest text-zinc-950"
        keyboardType="number-pad"
        maxLength={19}
        placeholder={placeholder}
        placeholderTextColor="#a1a1aa"
        textContentType="creditCardNumber"
        value={formattedValue}
        onChangeText={handleChangeText}
      />
    </View>
  );
}

export default CardNumberInput;
