import { useEffect, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../../App';
import { Header } from '../../../shared/components/Header';
import PaymentActionOptionList from '../components/PaymentActionOptionList';
import PaymentRequestSummary from '../components/PaymentRequestSummary';
import { getPaymentActionOptions } from '../utils/paymentMethodOptions';
import type {
    PaymentActionType,
    PaymentRequestSummary as PaymentRequestSummaryType,
} from '../types/paymentMethod.types';
import { validatePaymentQr } from '../api/paymentQrApi';
import { toPaymentRequestSummary } from '../utils/paymentQrAdapter';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentMethodSelect'>;

export default function PaymentMethodSelectScreen({ navigation, route }: Props) {
    const routeSummary = route.params?.summary;
    const routeToken = route.params?.token;
    const [summary, setSummary] = useState<PaymentRequestSummaryType | null>(
        routeSummary ?? null,
    );
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(
        routeSummary || routeToken ? '' : '결제 요청 token이 없습니다.',
    );
    const options = summary ? getPaymentActionOptions(summary.type) : [];

    useEffect(() => {
        if (routeSummary) {
            setSummary(routeSummary);
            setErrorMessage('');
            return;
        }

        if (!routeToken) {
            setSummary(null);
            setErrorMessage('결제 요청 token이 없습니다.');
            return;
        }

        let isMounted = true;

        const loadPaymentRequest = async () => {
            try {
                setIsLoading(true);
                setErrorMessage('');

                const qrResult = await validatePaymentQr(routeToken);

                if (qrResult.code !== 'VALID') {
                    if (isMounted) {
                        setSummary(null);
                        setErrorMessage('유효하지 않은 결제 요청입니다.');
                    }
                    return;
                }

                if (isMounted) {
                    setSummary(toPaymentRequestSummary(qrResult));
                }
            } catch {
                if (isMounted) {
                    setSummary(null);
                    setErrorMessage('결제 요청 정보를 불러오지 못했습니다.');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void loadPaymentRequest();

        return () => {
            isMounted = false;
        };
    }, [routeSummary, routeToken]);

    const handlePressClose = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
            return;
        }

        navigation.navigate('Guide');
    };

    const handlePressOption = (type: PaymentActionType) => {
        if (type === 'PAY') {
            if (!summary) {
                return;
            }

            navigation.navigate('PaymentCardSelect', {
                paymentId: summary.paymentId,
                amount: summary.amount,
            });
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

                {isLoading ? (
                    <Text className="px-4 pt-4 font-pretendard text-normal-regular text-neutral-black2">
                        결제 요청 정보를 확인 중입니다.
                    </Text>
                ) : null}

                {errorMessage ? (
                    <Text className="px-4 pt-4 font-pretendard text-normal-regular text-state-error">
                        {errorMessage}
                    </Text>
                ) : null}

                {summary ? <PaymentRequestSummary summary={summary} /> : null}

                {summary ? (
                    <PaymentActionOptionList
                        options={options}
                        onPressOption={handlePressOption}
                    />
                ) : null}
            </View>
        </SafeAreaView>
    );
}
