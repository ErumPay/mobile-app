import { Pressable, Text } from 'react-native';

type Props = {
    disabled: boolean;
    onPress: () => void;
};

export default function PaymentCardActionButton({
                                                    disabled,
                                                    onPress,
                                                }: Props) {
    return (
        <Pressable
            disabled={disabled}
            onPress={onPress}
            className={`rounded-xl px-4 py-4 ${
                disabled ? 'bg-neutral-grey1' : 'bg-erum-main'
            }`}
        >
            <Text className="text-center text-large-bold text-neutral-white">
                간편비밀번호 입력하기
            </Text>
        </Pressable>
    );
}