import { forwardRef, useState } from 'react';
import type {
  StyleProp,
  TextInput as RNTextInputRef,
  TextInputProps as RNTextInputProps,
  TextStyle,
} from 'react-native';
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

export const Input = forwardRef<RNTextInputRef, InputProps>(function Input(
  {
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
  },
  ref,
) {
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
    ? 'bg-neutral-grey3 text-neutral-black2'
    : 'bg-neutral-white text-neutral-black1';
  const heightClassName = props.multiline ? 'min-h-[96px]' : 'h-12';
  const inputStyle: StyleProp<TextStyle> = [
    {
      backgroundColor: readOnly ? '#F1F1F1' : '#FFFFFF',
      fontSize: 16,
      includeFontPadding: false,
      lineHeight: props.multiline ? 22 : 20,
      paddingBottom: props.multiline ? 12 : 0,
      paddingTop: props.multiline ? 12 : 0,
      textAlignVertical: props.multiline ? 'top' : 'center',
    },
    props.style,
  ];

  return (
    <View className="w-full">
      <Text className="mb-2 font-pretendard text-large-bold text-neutral-black1">
        {label}
      </Text>

      <RNTextInput
        ref={ref}
        className={`${heightClassName} w-full rounded-xl border px-4 py-0 font-pretendard ${borderClassName} ${stateClassName} ${className}`}
        style={inputStyle}
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
});

export default Input;
