/******************************************************************************
 * File: PinCodeKeypad.tsx
 * Description: 간편비밀번호 숫자 키패드 공통 컴포넌트
 * Worker: [FE] 조보름
 * Created: 2026-05-31
 * Note: 결제/회원가입 PIN 입력 화면에서 재사용하기 위해 생성했습니다.
 ******************************************************************************/

import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { colors } from '../../styles/designTokens';

type PinCodeKeypadProps = {
    onPressNumber: (value: string) => void;
    onPressDelete: () => void;
};

const keypadRows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'delete'],
];

export default function PinCodeKeypad({
                                          onPressNumber,
                                          onPressDelete,
                                      }: PinCodeKeypadProps) {
    return (
        <View className="w-full flex-[0.58] justify-center rounded-t-3xl bg-neutral-grey2 px-[7.5%] py-[4%]">
            <View className="w-full max-w-sm flex-1 self-center gap-3">
                {keypadRows.map((row, rowIndex) => (
                    <View key={rowIndex} className="flex-1 flex-row gap-3">
                        {row.map((item, columnIndex) => {
                            if (item === '') {
                                return (
                                    <View
                                        key={`${rowIndex}-${columnIndex}`}
                                        className="flex-1"
                                    />
                                );
                            }

                            const isDelete = item === 'delete';

                            return (
                                <Pressable
                                    key={`${rowIndex}-${columnIndex}`}
                                    accessibilityRole="button"
                                    accessibilityLabel={isDelete ? '삭제' : `${item} 입력`}
                                    accessibilityHint={
                                        isDelete ? '입력한 숫자 한 자리를 삭제합니다.' : undefined
                                    }
                                    className="flex-1 items-center justify-center rounded-xl bg-neutral-white shadow-sm"
                                    onPress={isDelete ? onPressDelete : () => onPressNumber(item)}
                                >
                                    {isDelete ? (
                                        <Feather
                                            name="delete"
                                            size={22}
                                            color={colors.neutral.black2}
                                        />
                                    ) : (
                                        <Text className="font-pretendard text-heading-2 text-neutral-black1">
                                            {item}
                                        </Text>
                                    )}
                                </Pressable>
                            );
                        })}
                    </View>
                ))}
            </View>
        </View>
    );
}
