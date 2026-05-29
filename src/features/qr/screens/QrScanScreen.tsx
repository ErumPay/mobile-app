import { Pressable, SafeAreaView, Text, View } from 'react-native';
import { Header } from '../../../shared/components/Header';

export default function QrScanScreen() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
            <View
                className="flex-1"
                style={{ backgroundColor: '#000000' }}
            >
                <Header
                    title="카드 촬영"
                    tone="dark"
                    leftIcon={<Text className="font-pretendard text-heading-2 text-white">×</Text>}
                    onPressLeft={() => {}}
                />

                <View className="flex-1 items-center justify-center px-9 pb-12 pt-6">
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
                        className="w-full items-center justify-center rounded-[28px] bg-erum-main px-5 py-4"
                    >
                        <Text className="font-pretendard text-heading-3 text-white">
                            QR 코드 스캔
                        </Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}