import type { TextInputProps as RNTextInputProps } from 'react-native';
import { Text, TextInput as RNTextInput, View } from 'react-native';

type InputType = 'text' | 'number';

type InputProps = Omit<RNTextInputProps, 'keyboardType' | 'onChangeText'> & {
  label: string;
  type?: InputType;
  errorMessage?: string;
  onChangeText?: (value: string) => void;
};

/**
 * 공통 Input 컴포넌트
 *
 * type="text": 이름, 별칭처럼 일반 문자를 입력받을 때 사용합니다.
 *
 * <Input
 *   label="이름"
 *   type="text"
 *   placeholder="이름을 입력해주세요."
 *   value={name}
 *   onChangeText={setName}
 * />
 *
 * type="number": 카드번호, 휴대폰번호처럼 숫자만 입력받을 때 사용합니다.
 *
 * <Input
 *   label="카드번호"
 *   type="number"
 *   placeholder="카드번호를 입력해주세요."
 *   value={cardNumber}
 *   maxLength={16}
 *   onChangeText={setCardNumber}
 * />
 */
export function Input({
  label,
  type = 'text',
  errorMessage,
  className = '',
  placeholderTextColor = '#B4B8BD',
  onChangeText,
  ...props
}: InputProps) {
  const handleChangeText = (text: string) => {
    if (type === 'number') {
      onChangeText?.(text.replace(/\D/g, ''));
      return;
    }

    onChangeText?.(text);
  };

  return (
    <View className="w-full">
      <Text className="mb-2 font-pretendard text-large-bold text-neutral-black1">
        {label}
      </Text>

      <RNTextInput
        className={`min-h-[46px] w-full rounded-xl border bg-neutral-white px-4 py-3 font-pretendard text-large-regular text-neutral-black1 ${
          errorMessage ? 'border-state-error' : 'border-neutral-grey1'
        } ${className}`}
        keyboardType={type === 'number' ? 'number-pad' : 'default'}
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

export default Input;
