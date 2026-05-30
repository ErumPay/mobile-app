import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, SafeAreaView, Text, View } from 'react-native';

import type { RootStackParamList } from '../../../../App';
import { Header } from '../../../shared/components/Header';
import { mockPaymentRequestSummary } from '../constants/paymentMethod.mock';
import PaymentActionOptionList from '../components/PaymentActionOptionList';
import PaymentRequestSummary from '../components/PaymentRequestSummary';
import { getPaymentActionOptions } from '../utils/paymentMethodOptions';
import type { PaymentActionType } from '../types/paymentMethod.types';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentMethodSelect'>;

export default function PaymentMethodSelectScreen({ navigation }: Props) {
    const options = getPaymentActionOptions(mockPaymentRequestSummary.type);

    const handlePressClose = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
            return;
        }

        navigation.navigate('Guide');
    };

    const handlePressOption = (type: PaymentActionType) => {
        if (type === 'PAY') {
            navigation.navigate('PaymentCardSelect');
            return;
        }

        Alert.alert('결제 수단 선택', `${type} 액션이 선택되었습니다.`);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <View className="flex-1 bg-neutral-white">
                <Header
                    title="결제 수단 선택"
                    type="close"
                    onPressRight={handlePressClose}
                />

                <View className="h-px bg-neutral-grey1" />

                <PaymentRequestSummary summary={mockPaymentRequestSummary} />

                <PaymentActionOptionList
                    options={options}
                    onPressOption={handlePressOption}
                />
            </View>
        </SafeAreaView>
    );
}