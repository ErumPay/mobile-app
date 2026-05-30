import type { TextInputProps as RNTextInputProps } from 'react-native';
import { Text, TextInput, View } from 'react-native';

type NumberInputProps = Omit<RNTextInputProps, 'keyboardType' | 'onChangeText'> & {
  label: string;
  errorMessage?: string;
  onChangeText?: (value: string) => void;
};

/**
 * 숫자 입력 Input
 *
 * 카드번호, 휴대폰번호처럼 숫자만 입력받을 때 사용합니다.
 *
 * 사용 예시:
 *
 * <NumberInput
 *   label="카드번호"
 *   placeholder="카드번호를 입력해주세요."
 *   value={cardNumber}
 *   maxLength={16}
 *   onChangeText={setCardNumber}
 * />
 */
export function NumberInput({
  label,
  errorMessage,
  className = '',
  placeholderTextColor = '#B4B8BD',
  onChangeText,
  ...props
}: NumberInputProps) {
  const handleChangeText = (text: string) => {
    onChangeText?.(text.replace(/\D/g, ''));
  };

  return (
    <View className="w-full">
      <Text className="mb-2 font-pretendard text-large-bold text-neutral-black1">
        {label}
      </Text>

      <TextInput
        className={`min-h-[46px] w-full rounded-xl border bg-neutral-white px-4 py-3 font-pretendard text-large-regular text-neutral-black1 ${
          errorMessage ? 'border-state-error' : 'border-neutral-grey1'
        } ${className}`}
        keyboardType="number-pad"
        placeholderTextColor={placeholderTextColor}
        onChangeText={handleChangeText}
        {...props}
      />

      {errorMessage ? (
        <Text className="mt-2 font-pretendard text-normal-regular text-state-error">
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}

export default NumberInput;