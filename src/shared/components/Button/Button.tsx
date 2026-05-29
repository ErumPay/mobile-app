/******************************************************************************
 * File: Button.tsx
 * Description: 주요/보조/위험 액션에 사용하는 공통 버튼 컴포넌트
 * Worker: [FE] 조보름
 * Created: 2026-05-29
 * Note: 화면별 액션 버튼 스타일을 디자인 토큰 기준으로 통일하기 위해 생성했습니다.
 ******************************************************************************/

import type { ReactNode } from 'react';
import { Pressable, Text } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'medium' | 'large';

type ButtonProps = {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  readOnly?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onPress?: () => void;
};

const buttonClassNameByVariant: Record<ButtonVariant, string> = {
  primary: 'bg-erum-main',
  secondary: 'border border-erum-main bg-neutral-white',
  danger: 'bg-state-error',
  ghost: 'bg-transparent',
};

const textClassNameByVariant: Record<ButtonVariant, string> = {
  primary: 'text-neutral-white',
  secondary: 'text-erum-main',
  danger: 'text-neutral-white',
  ghost: 'text-neutral-black2',
};

const buttonClassNameBySize: Record<ButtonSize, string> = {
  medium: 'min-h-[44px] px-4 py-3',
  large: 'min-h-[52px] px-5 py-4',
};

function getButtonClassName({
  disabled,
  readOnly,
  variant,
}: {
  disabled: boolean;
  readOnly: boolean;
  variant: ButtonVariant;
}) {
  if (disabled) {
    return 'bg-neutral-grey1 opacity-60';
  }

  if (readOnly) {
    return 'border border-neutral-grey1 bg-neutral-grey2';
  }

  return buttonClassNameByVariant[variant];
}

function getTextClassName({
  disabled,
  readOnly,
  variant,
}: {
  disabled: boolean;
  readOnly: boolean;
  variant: ButtonVariant;
}) {
  if (disabled) {
    return 'text-neutral-disabled';
  }

  if (readOnly) {
    return 'text-neutral-black2';
  }

  return textClassNameByVariant[variant];
}

export function Button({
  label,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  readOnly = false,
  leftIcon,
  rightIcon,
  onPress,
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`w-full flex-row items-center justify-center gap-2 rounded-lg ${
        getButtonClassName({ disabled, readOnly, variant })
      } ${buttonClassNameBySize[size]}`}
      disabled={disabled || readOnly}
      onPress={onPress}
    >
      {leftIcon}
      <Text
        numberOfLines={1}
        className={`font-pretendard text-large-bold ${
          getTextClassName({ disabled, readOnly, variant })
        }`}
      >
        {label}
      </Text>
      {rightIcon}
    </Pressable>
  );
}

export default Button;
