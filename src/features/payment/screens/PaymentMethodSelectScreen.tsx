import { useEffect, useRef, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../../App';
import { Header } from '../../../shared/components/Header';
import Modal from '../../../shared/components/Modal';
import PaymentMockBadge from '../components/PaymentMockBadge';
import PaymentStopConfirmModal from '../components/PaymentStopConfirmModal';
import PaymentActionOptionList from '../components/PaymentActionOptionList';
import PaymentRequestSummary from '../components/PaymentRequestSummary';
import { getPaymentActionOptions } from '../utils/paymentMethodOptions';
import type {
    PaymentActionType,
    PaymentRequestSummary as PaymentRequestSummaryType,
} from '../types/paymentMethod.types';
import { validatePaymentQr } from '../api/paymentQrApi';
import { toPaymentRequestSummary } from '../utils/paymentQrAdapter';
import { createPaymentIdempotencyKey } from '../utils/paymentIdempotencyKey';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentMethodSelect'>;

export default function PaymentMethodSelectScreen({ navigation, route }: Props) {
    const routeSummary = route.params?.summary;
    const routeToken = route.params?.token;
    const paymentIdempotencyKeyMap = useRef(new Map<number, string>());
    const [summary, setSummary] = useState<PaymentRequestSummaryType | null>(
        routeSummary ?? null,
    );
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(
        routeSummary || routeToken ? '' : '결제 요청 token이 없습니다.',
    );
    const [stopModalVisible, setStopModalVisible] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [remoteRequestCompleteModalVisible, setRemoteRequestCompleteModalVisible] =
        useState(false);
    const options = summary ? getPaymentActionOptions(summary.type) : [];
    const stopModalDescription =
        summary?.type === 'DUTCH_PAY_PARTICIPANT' ||
        summary?.type === 'REMOTE_RECIPIENT'
            ? '중지하셔도 메인에서 결제 진행상태를 확인할 수 있습니다.'
            : undefined;

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
        setStopModalVisible(true);
    };

    const handleConfirmStopPayment = () => {
        setStopModalVisible(false);

        if (navigation.canGoBack()) {
            navigation.goBack();
            return;
        }

        navigation.navigate('Main');
    };

    const handlePressOption = (type: PaymentActionType) => {
        if (type === 'PAY') {
            if (!summary) {
                return;
            }

            const existingIdempotencyKey = paymentIdempotencyKeyMap.current.get(
                summary.paymentId,
            );
            const idempotencyKey =
                existingIdempotencyKey ??
                createPaymentIdempotencyKey(summary.paymentId);

            paymentIdempotencyKeyMap.current.set(
                summary.paymentId,
                idempotencyKey,
            );

            navigation.navigate('PaymentCardSelect', {
                paymentId: summary.paymentId,
                amount: summary.amount,
                idempotencyKey,
            });
            return;
        }

        if (type === 'REJECT') {
            setRejectModalVisible(true);
            return;
        }

        if (type === 'REMOTE_REQUEST') {
            setRemoteRequestCompleteModalVisible(true);
            return;
        }

        if (type === 'DUTCH_PAY') {
            navigation.navigate('PaymentParticipantSelect', {
                mode: 'DUTCH_PAY',
            });
            return;
        }

        Alert.alert('결제 수단 선택', `${type} 액션이 선택되었습니다.`);
    };

    const handleConfirmReject = () => {
        setRejectModalVisible(false);
        navigation.navigate('Main');
    };

    const handleConfirmRemoteRequestComplete = () => {
        setRemoteRequestCompleteModalVisible(false);
        navigation.navigate('Main');
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

                <ScrollView
                    className="flex-1"
                    contentContainerClassName="pb-6"
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
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

                    {summary ? (
                        <>
                            {routeSummary ? (
                                <View className="px-4 pt-4">
                                    <PaymentMockBadge />
                                </View>
                            ) : null}
                            <PaymentRequestSummary summary={summary} />
                        </>
                    ) : null}

                    {summary ? (
                        <PaymentActionOptionList
                            options={options}
                            onPressOption={handlePressOption}
                        />
                    ) : null}
                </ScrollView>
                <PaymentStopConfirmModal
                    visible={stopModalVisible}
                    description={stopModalDescription}
                    onConfirm={handleConfirmStopPayment}
                    onCancel={() => setStopModalVisible(false)}
                />
                <Modal
                    visible={rejectModalVisible}
                    type="two"
                    title="결제 요청을 거절하시겠습니까?"
                    description="거절하면 요청자에게 거절 상태가 전달됩니다."
                    confirmLabel="예"
                    cancelLabel="아니오"
                    onConfirm={handleConfirmReject}
                    onCancel={() => setRejectModalVisible(false)}
                    onClose={() => setRejectModalVisible(false)}
                />
                <Modal
                    visible={remoteRequestCompleteModalVisible}
                    type="one"
                    title="원격결제 요청이 전송되었습니다."
                    description="메인에서 결제 진행상태를 확인할 수 있습니다."
                    confirmLabel="확인"
                    onConfirm={handleConfirmRemoteRequestComplete}
                    onClose={handleConfirmRemoteRequestComplete}
                />
            </View>
        </SafeAreaView>
    );
}
