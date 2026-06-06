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
import { Modal } from '../../../shared/components/Modal';
import {
    PaymentQrValidateError,
    validatePaymentQr,
} from '../../payment/api/paymentQrApi';
import PaymentStopConfirmModal from '../../payment/components/PaymentStopConfirmModal';
import QrRescanModal from '../../payment/components/QrRescanModal';
import { toPaymentRequestSummary } from '../../payment/utils/paymentQrAdapter';
import { normalizePaymentQrToken } from '../../payment/utils/paymentQrToken';
import { fetchManagedCards } from '../../mypage/api/mypageApi';

type Props = NativeStackScreenProps<RootStackParamList, 'QrScan'>;
type ToastType = 'success' | 'error' | 'info';
type QrScanErrorContent = {
    title: string;
    description?: string;
    confirmLabel?: string;
};

const DEFAULT_QR_SCAN_ERROR_CONTENT: QrScanErrorContent = {
    title: 'QR을 다시 스캔해주세요.',
    confirmLabel: '다시 스캔하기',
};

export default function QrScanScreen({ navigation }: Props) {
    const scanLockRef = useRef(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<ToastType>('info');
    const [isValidating, setIsValidating] = useState(false);
    const [stopModalVisible, setStopModalVisible] = useState(false);
    const [rescanModalVisible, setRescanModalVisible] = useState(false);
    const [noCardModalVisible, setNoCardModalVisible] = useState(false);
    const [rescanModalContent, setRescanModalContent] =
        useState<QrScanErrorContent>(DEFAULT_QR_SCAN_ERROR_CONTENT);

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
        setRescanModalContent(DEFAULT_QR_SCAN_ERROR_CONTENT);
    };

    const showQrScanError = (content = DEFAULT_QR_SCAN_ERROR_CONTENT) => {
        setRescanModalContent(content);
        setRescanModalVisible(true);
    };

    const handlePressRegisterCard = () => {
        setNoCardModalVisible(false);
        scanLockRef.current = false;
        navigation.navigate('CardRegister');
    };

    const handleCloseNoCardModal = () => {
        setNoCardModalVisible(false);
        scanLockRef.current = false;
    };

    const validateScannedQr = async (scannedValue: string) => {
        if (scanLockRef.current || isValidating) {
            return;
        }

        scanLockRef.current = true;
        const token = normalizePaymentQrToken(scannedValue);

        if (!token) {
            showQrScanError({
                title: '유효하지 않은 QR입니다.',
                description: '결제 QR인지 확인 후 다시 스캔해주세요.',
                confirmLabel: '다시 스캔하기',
            });
            return;
        }

        try {
            setIsValidating(true);

            const qrResult = await validatePaymentQr(token);

            if (qrResult.code !== 'VALID') {
                showQrScanError({
                    title: '유효하지 않은 QR입니다.',
                    description: '결제 QR인지 확인 후 다시 스캔해주세요.',
                    confirmLabel: '다시 스캔하기',
                });
                return;
            }

            const managedCards = await fetchManagedCards().catch(() => null);
            const hasAvailableCard =
                managedCards?.some((card) => !card.disabled) ?? true;

            if (managedCards && !hasAvailableCard) {
                setNoCardModalVisible(true);
                return;
            }

            navigation.navigate('PaymentMethodSelect', {
                summary: toPaymentRequestSummary(qrResult),
            });
        } catch (error) {
            showQrScanError(getQrScanErrorContent(error));
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
                    title="QR 스캔"
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
                title={rescanModalContent.title}
                description={rescanModalContent.description}
                confirmLabel={rescanModalContent.confirmLabel}
                onConfirm={handlePressRescan}
            />
            <Modal
                visible={noCardModalVisible}
                type="two"
                icon={
                    <Feather
                        name="credit-card"
                        size={52}
                        color="#2FAB84"
                    />
                }
                title="등록된 카드가 없습니다."
                description="결제를 진행하려면 카드를 먼저 등록해주세요."
                confirmLabel="카드 등록하기"
                cancelLabel="닫기"
                onConfirm={handlePressRegisterCard}
                onCancel={handleCloseNoCardModal}
                onClose={handleCloseNoCardModal}
            />
        </SafeAreaView>
    );
}

function getQrScanErrorContent(error: unknown): QrScanErrorContent {
    if (error instanceof PaymentQrValidateError) {
        switch (error.reason) {
            case 'QR_USED':
            case 'PAYMENT_ALREADY_PROCESSED':
                return {
                    title: '이미 처리된 결제입니다.',
                    description: '새 결제 QR로 다시 시도해주세요.',
                    confirmLabel: '확인',
                };
            case 'QR_EXPIRED':
                return {
                    title: '만료된 QR입니다.',
                    description: '새 결제 QR을 생성한 뒤 다시 스캔해주세요.',
                    confirmLabel: '다시 스캔하기',
                };
            case 'QR_NOT_FOUND':
            case 'QR_INVALID_TOKEN':
            case 'QR_TOKEN_REQUIRED':
                return {
                    title: '유효하지 않은 QR입니다.',
                    description: '결제 QR인지 확인 후 다시 스캔해주세요.',
                    confirmLabel: '다시 스캔하기',
                };
            default:
                return {
                    title: 'QR을 확인하지 못했습니다.',
                    description: error.message || '잠시 후 다시 스캔해주세요.',
                    confirmLabel: '다시 스캔하기',
                };
        }
    }

    return DEFAULT_QR_SCAN_ERROR_CONTENT;
}
