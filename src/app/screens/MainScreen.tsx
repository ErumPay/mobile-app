import { Button, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>;

export default function MainScreen({ navigation }: Props) {
    return (
        <View>
            <Text>ERoom Pay</Text>

            <Button
                title="카드결제"
                onPress={() => navigation.navigate('PaymentMethodSelect')}
            />

            <Button
                title="카드 등록"
                onPress={() => navigation.navigate('CardManualRegister')}
            />
        </View>
    );
}