import { useState } from 'react';
import type { TextInputProps as RNTextInputProps } from 'react-native';
import { Text, TextInput as RNTextInput, View } from 'react-native';

type InputType = 'text' | 'number';

type InputProps = Omit<
  RNTextInputProps,
  'keyboardType' | 'onChangeText' | 'editable'
> & {
  label: string;
  type?: InputType;
  errorMessage?: string;
  readOnly?: boolean;
  onChangeText?: (value: string) => void;
};

export function Input({
  label,
  type = 'text',
  errorMessage,
  readOnly = false,
  className = '',
  placeholderTextColor = '#B4B8BD',
  onChangeText,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleChangeText = (text: string) => {
    if (readOnly) {
      return;
    }

    if (type === 'number') {
      onChangeText?.(text.replace(/\D/g, ''));
      return;
    }

    onChangeText?.(text);
  };

  const handleFocus: NonNullable<RNTextInputProps['onFocus']> = (event) => {
  if (readOnly) {
    return;
  }

  setIsFocused(true);
  onFocus?.(event);
};

const handleBlur: NonNullable<RNTextInputProps['onBlur']> = (event) => {
  if (readOnly) {
    return;
  }

  setIsFocused(false);
  onBlur?.(event);
};

  const borderClassName = readOnly
  ? 'border-neutral-grey1'
  : errorMessage
    ? 'border-state-error'
    : isFocused
      ? 'border-erum-main'
      : 'border-neutral-grey1';

  const stateClassName = readOnly
    ? 'bg-neutral-grey2 text-neutral-black2'
    : 'bg-neutral-white text-neutral-black1';

  return (
    <View className="w-full">
      <Text className="mb-2 font-pretendard text-large-bold text-neutral-black1">
        {label}
      </Text>

      <RNTextInput
        className={`min-h-[46px] w-full rounded-xl border px-4 py-3 font-pretendard text-large-regular ${borderClassName} ${stateClassName} ${className}`}
        editable={!readOnly}
        pointerEvents={readOnly ? 'none' : 'auto'}
        selectTextOnFocus={!readOnly}
        caretHidden={readOnly}
        keyboardType={type === 'number' ? 'number-pad' : 'default'}
        placeholderTextColor={placeholderTextColor}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
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