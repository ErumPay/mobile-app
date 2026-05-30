import type { TextInputProps as RNTextInputProps } from 'react-native';
import { Text, TextInput as RNTextInput, View } from 'react-native';

/**
 * 문자 입력 Input
 *
 * 이름, 별칭처럼 일반 텍스트를 입력받을 때 사용합니다.
 *
 * 사용 예시:
 *
 * <TextInput
 *   label="이름"
 *   placeholder="이름을 입력해주세요."
 *   value={name}
 *   onChangeText={setName}
 * />
 */
type TextInputProps = RNTextInputProps & {
  label: string;
  errorMessage?: string;
};

export function TextInput({
  label,
  errorMessage,
  className = '',
  placeholderTextColor = '#B4B8BD',
  ...props
}: TextInputProps) {
  return (
    <View className="w-full">
      <Text className="mb-2 font-pretendard text-large-bold text-neutral-black1">
        {label}
      </Text>

      <RNTextInput
        className={`min-h-[46px] w-full rounded-xl border bg-neutral-white px-4 py-3 font-pretendard text-large-regular text-neutral-black1 ${
          errorMessage ? 'border-state-error' : 'border-neutral-grey1'
        } ${className}`}
        placeholderTextColor={placeholderTextColor}
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

export default TextInput;