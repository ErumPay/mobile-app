import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import {
    CameraView,
    useCameraPermissions,
    type BarcodeScanningResult,
} from 'expo-camera';

import { Toast } from '../../../shared/components/Toast';
import type { RootStackParamList } from '../../../../App';
import { Header } from '../../../shared/components/Header';
import { validatePaymentQr } from '../../payment/api/paymentQrApi';
import PaymentStopConfirmModal from '../../payment/components/PaymentStopConfirmModal';
import QrRescanModal from '../../payment/components/QrRescanModal';
import { toPaymentRequestSummary } from '../../payment/utils/paymentQrAdapter';
import { normalizePaymentQrToken } from '../../payment/utils/paymentQrToken';

type Props = NativeStackScreenProps<RootStackParamList, 'QrScan'>;
type ToastType = 'success' | 'error' | 'info';

export default function QrScanScreen({ navigation }: Props) {
    const scanLockRef = useRef(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<ToastType>('info');
    const [isValidating, setIsValidating] = useState(false);
    const [stopModalVisible, setStopModalVisible] = useState(false);
    const [rescanModalVisible, setRescanModalVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            scanLockRef.current = false;
        }, []),
    );

    const showToast = (message: string, type: ToastType) => {
        setToastMessage(message);
        setToastType(type);
        setToastVisible(true);

        setTimeout(() => {
            setToastVisible(false);
        }, 1500);
    };

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

    const handlePressRescan = () => {
        scanLockRef.current = false;
        setIsValidating(false);
        setRescanModalVisible(false);
    };

    const validateScannedQr = async (scannedValue: string) => {
        if (scanLockRef.current || isValidating) {
            return;
        }

        const token = normalizePaymentQrToken(scannedValue);

        if (!token) {
            scanLockRef.current = false;
            setRescanModalVisible(true);
            return;
        }

        try {
            scanLockRef.current = true;
            setIsValidating(true);

            const qrResult = await validatePaymentQr(token);

            if (qrResult.code !== 'VALID') {
                scanLockRef.current = false;
                setRescanModalVisible(true);
                return;
            }

            navigation.navigate('PaymentMethodSelect', {
                summary: toPaymentRequestSummary(qrResult),
            });
        } catch {
            scanLockRef.current = false;
            setRescanModalVisible(true);
        } finally {
            setIsValidating(false);
        }
    };

    const handleBarcodeScanned = (result: BarcodeScanningResult) => {
        void validateScannedQr(result.data);
    };

    const handlePressScan = () => {
        if (!permission?.granted) {
            void requestPermission();
            return;
        }

        showToast('QR 코드를 카메라 프레임 안에 위치시켜 주세요.', 'info');
    };

    const renderCameraFrame = () => {
        if (!permission) {
            return (
                <View className="flex-1 items-center justify-center bg-neutral-black1">
                    <Text className="font-pretendard text-large-regular text-white">
                        카메라 권한 확인 중
                    </Text>
                </View>
            );
        }

        if (!permission.granted) {
            return (
                <View className="flex-1 items-center justify-center bg-neutral-black1 px-5">
                    <Text className="text-center font-pretendard text-large-regular text-white">
                        QR 스캔을 위해 카메라 권한이 필요합니다.
                    </Text>
                </View>
            );
        }

        return (
            <CameraView
                style={{ flex: 1 }}
                facing="back"
                barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                }}
                onBarcodeScanned={
                    scanLockRef.current ? undefined : handleBarcodeScanned
                }
            />
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
            <View
                className="flex-1"
                style={{ backgroundColor: '#000000' }}
            >
                <Header
                    title="카드 촬영"
                    tone="dark"
                    leftIcon={<Feather name="x" size={28} color="#FFFFFF" />}
                    onPressLeft={handlePressClose}
                />

                <ScrollView
                    className="flex-1"
                    contentContainerClassName="flex-grow items-center justify-center px-9 pb-12 pt-6"
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View className="w-full pb-6">
                        <Text className="mb-8 text-center font-pretendard text-heading-3 text-white">
                            QR 코드를 스캔하세요
                        </Text>

                        <View className="h-[300px] w-full max-w-[300px] self-center overflow-hidden rounded-[28px] border-4 border-neutral-grey1">
                            {renderCameraFrame()}
                        </View>

                        <Text className="mt-8 text-center font-pretendard text-large-regular leading-7 text-white">
                            QR 코드를 카메라 프레임 안에{'\n'}위치시켜 주세요
                        </Text>
                    </View>

                    <Pressable
                        accessibilityRole="button"
                        disabled={isValidating}
                        className="w-full items-center justify-center flex-row gap-2 rounded-[28px] bg-erum-main px-5 py-4"
                        onPress={handlePressScan}
                    >
                        <Feather name="camera" size={22} color="#FFFFFF" />
                        <Text className="font-pretendard text-heading-3 text-white">
                            {isValidating
                                ? '확인 중'
                                : permission?.granted
                                  ? 'QR 코드 스캔'
                                  : '카메라 권한 허용'}
                        </Text>
                    </Pressable>
                </ScrollView>
            </View>

            <Toast
                visible={toastVisible}
                message={toastMessage}
                type={toastType}
            />
            <PaymentStopConfirmModal
                visible={stopModalVisible}
                onConfirm={handleConfirmStopPayment}
                onCancel={() => setStopModalVisible(false)}
            />
            <QrRescanModal
                visible={rescanModalVisible}
                onConfirm={handlePressRescan}
            />
        </SafeAreaView>
    );
}
