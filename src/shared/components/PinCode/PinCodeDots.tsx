/******************************************************************************
 * File: PinCodeDots.tsx
 * Description: 간편비밀번호 입력 상태를 6개 점으로 표시하는 공통 컴포넌트
 * Worker: [FE] 조보름
 * Created: 2026-05-31
 * Note: 결제/회원가입 PIN 입력 화면에서 재사용하기 위해 생성했습니다.
 ******************************************************************************/

import { View } from 'react-native';

type PinCodeDotsProps = {
    valueLength: number;
    maxLength?: number;
    hasError?: boolean;
};

export default function PinCodeDots({
                                        valueLength,
                                        maxLength = 6,
                                        hasError = false,
                                    }: PinCodeDotsProps) {
    return (
        <View className="flex-row items-center justify-center gap-3">
            {Array.from({ length: maxLength }).map((_, index) => {
                const isFilled = index < valueLength;

                return (
                    <View
                        key={index}
                        className={`h-3 w-3 rounded-full ${
                            isFilled
                                ? hasError
                                    ? 'bg-state-error'
                                    : 'bg-erum-main'
                                : 'bg-neutral-disabled'
                        }`}
                    />
                );
            })}
        </View>
    );
}