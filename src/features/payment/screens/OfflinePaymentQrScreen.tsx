import { useCallback, useEffect, useMemo, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, Image, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../../App';
import { Button } from '../../../shared/components/Button';
import { Header } from '../../../shared/components/Header';
import { colors } from '../../../shared/styles/designTokens';
import { fetchMerchantName } from '../api/merchantApi';
import { requestOfflinePaymentQrImage } from '../api/paymentQrApi';
import type { OfflinePaymentQrRequestPayload } from '../types/offlinePaymentQr.types';

type Props = NativeStackScreenProps<RootStackParamList, 'OfflinePaymentQr'>;

const DEFAULT_PAYMENT_QR_REQUEST: OfflinePaymentQrRequestPayload = {
    merchant_id: 101,
    amount: 777777,
    channel_type: 'OFFLINE',
};

function formatAmount(amount: number) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function normalizeChannelType(value?: string): OfflinePaymentQrRequestPayload['channel_type'] {
    const channelType = value?.trim().toUpperCase();

    return channelType === 'ONLINE' || channelType === 'OFFLINE'
        ? channelType
        : DEFAULT_PAYMENT_QR_REQUEST.channel_type;
}

function normalizeMerchantName(value?: string) {
    const merchantName = value?.trim();

    return merchantName ? merchantName : undefined;
}

export default function OfflinePaymentQrScreen({ navigation, route }: Props) {
    const routeMerchantName = normalizeMerchantName(route.params?.merchantName);
    const [qrImageUri, setQrImageUri] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [resolvedMerchantName, setResolvedMerchantName] = useState(
        routeMerchantName ?? '가맹점',
    );

    const payload = useMemo<OfflinePaymentQrRequestPayload>(
        () => ({
            merchant_id:
                route.params?.merchantId ?? DEFAULT_PAYMENT_QR_REQUEST.merchant_id,
            amount: route.params?.amount ?? DEFAULT_PAYMENT_QR_REQUEST.amount,
            channel_type: normalizeChannelType(route.params?.channelType),
        }),
        [route.params?.amount, route.params?.channelType, route.params?.merchantId],
    );
    const merchantName = routeMerchantName ?? resolvedMerchantName;

    const loadQrImage = useCallback(async () => {
        try {
            setIsLoading(true);
            setErrorMessage('');

            const nextQrImageUri = await requestOfflinePaymentQrImage(payload);

            setQrImageUri(nextQrImageUri);
        } catch {
            setQrImageUri('');
            setErrorMessage('결제 QR을 불러오지 못했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, [payload]);

    useEffect(() => {
        void loadQrImage();
    }, [loadQrImage]);

    useEffect(() => {
        if (routeMerchantName) {
            setResolvedMerchantName(routeMerchantName);
            return;
        }

        let isMounted = true;

        fetchMerchantName(payload.merchant_id)
            .then((merchantName) => {
                if (isMounted) {
                    setResolvedMerchantName(merchantName);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setResolvedMerchantName('가맹점');
                }
            });

        return () => {
            isMounted = false;
        };
    }, [payload.merchant_id, routeMerchantName]);

    const handlePressClose = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
            return;
        }

        navigation.navigate('Main');
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
            <View className="flex-1 bg-black">
                <Header
                    title="결제 QR"
                    type="close"
                    tone="dark"
                    onPressRight={handlePressClose}
                />

                <View className="flex-1 items-center justify-center px-8 pb-8">
                    <View className="w-full items-center">
                        <Text className="font-pretendard text-heading-2 text-neutral-white">
                            QR 코드를 보여주세요
                        </Text>

                        <Text className="mt-3 text-center font-pretendard text-large-regular text-neutral-grey1">
                            가맹점 POS에서 결제 정보를 확인할 수 있습니다.
                        </Text>
                    </View>

                    <View className="my-10 w-full items-center">
                        <View className="w-[78%] max-w-[340px] rounded-[28px] border border-neutral-grey1 bg-neutral-white p-5">
                            <View className="aspect-square w-full items-center justify-center">
                                {isLoading ? (
                                    <ActivityIndicator
                                        size="large"
                                        color={colors.erum.main}
                                    />
                                ) : null}

                                {!isLoading && qrImageUri ? (
                                    <Image
                                        source={{ uri: qrImageUri }}
                                        resizeMode="contain"
                                        className="h-full w-full"
                                    />
                                ) : null}

                                {!isLoading && !qrImageUri ? (
                                    <Text className="text-center font-pretendard text-normal-regular text-neutral-black2">
                                        QR 이미지가 없습니다.
                                    </Text>
                                ) : null}
                            </View>
                        </View>
                    </View>

                    <View className="w-full items-center">
                        <Text className="font-pretendard text-large-bold text-neutral-white">
                            {merchantName}
                        </Text>

                        <Text className="mt-2 font-pretendard text-heading-2 text-neutral-white">
                            {formatAmount(payload.amount)}원
                        </Text>

                        {errorMessage ? (
                            <Text className="mt-4 text-center font-pretendard text-normal-regular text-state-error">
                                {errorMessage}
                            </Text>
                        ) : null}
                    </View>

                    <View className="mt-8 w-full max-w-[360px]">
                        <Button
                            label={isLoading ? 'QR 생성 중' : 'QR 다시 생성하기'}
                            disabled={isLoading}
                            onPress={loadQrImage}
                        />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
