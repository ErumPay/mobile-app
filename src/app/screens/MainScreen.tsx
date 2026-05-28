import { Button, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>;

export default function MainScreen({ navigation }: Props) {
    return (
        <View>
            <Text>ERoom Pay</Text>

            <Button
                title="IA 가이드"
                onPress={() => navigation.navigate('Guide')}
            />

            {/*
            // [fe] 조보름 260528 1050 |   KAN-1151 카드결제 화면 브랜치 병합 후 연결 예정
            <Button
                title="카드결제"
                onPress={() => navigation.navigate('PaymentMethodSelect')}
            />*/}

            <Button
                title="카드 등록"
                onPress={() => navigation.navigate('CardManualRegister')}
            />
        </View>
    );
}
