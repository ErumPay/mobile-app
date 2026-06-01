import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';

import { Toast } from '../../../shared/components/Toast';
import type { RootStackParamList } from '../../../../App';
import { Header } from '../../../shared/components/Header';

type Props = NativeStackScreenProps<RootStackParamList, 'QrScan'>;

export default function QrScanScreen({ navigation }: Props) {
    const [toastVisible, setToastVisible] = useState(false);

    const handlePressClose = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
            return;
        }

        navigation.navigate('Guide');
    };

    const handlePressScan = () => {
        setToastVisible(true);

        setTimeout(() => {
            setToastVisible(false);
        }, 1500);
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

                        <View className="h-[300px] w-full max-w-[300px] self-center rounded-[28px] border-4 border-neutral-grey1" />

                        <Text className="mt-8 text-center font-pretendard text-large-regular leading-7 text-white">
                            QR 코드를 카메라 프레임 안에{'\n'}위치시켜 주세요
                        </Text>
                    </View>

                    <Pressable
                        accessibilityRole="button"
                        className="w-full items-center justify-center flex-row gap-2 rounded-[28px] bg-erum-main px-5 py-4"
                        onPress={handlePressScan}
                    >
                        <Feather name="camera" size={22} color="#FFFFFF" />
                        <Text className="font-pretendard text-heading-3 text-white">
                            QR 코드 스캔
                        </Text>
                    </Pressable>
                </ScrollView>
            </View>

            <Toast
                visible={toastVisible}
                message="QR 코드가 인식되었습니다."
                type="success"
            />
        </SafeAreaView>
    );
}
