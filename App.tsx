import './global.css';

import { useEffect, useRef } from 'react';
import { Alert, useWindowDimensions, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
    NavigationContainer,
    type LinkingOptions,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import GuideScreen from './src/app/screens/GuideScreen';
import MainScreen from './src/app/screens/MainScreen';
import CardManualRegisterScreen from './src/features/card/screens/CardManualRegisterScreen';
import QrScanScreen from './src/features/qr/screens/QrScanScreen';
import PaymentMethodSelectScreen from './src/features/payment/screens/PaymentMethodSelectScreen';
import PaymentCardSelectScreen from './src/features/payment/screens/PaymentCardSelectScreen';
import PaymentPinScreen from './src/features/payment/screens/PaymentPinScreen';
import type { PaymentRequestSummary } from './src/features/payment/types/paymentMethod.types';
import type { PaymentPinRouteParams } from './src/features/payment/types/paymentPin.types';
// [fe] 조보름 260528 1050 |   KAN-1151 카드결제 화면 브랜치 병합 후 연결 예정
// import PaymentMethodSelectScreen from './src/features/payment/screens/PaymentMethodSelectScreen';

export type RootStackParamList = {
    Main: undefined;
    Guide: undefined;
    QrScan: undefined;
    PaymentMethodSelect:
        | { summary?: PaymentRequestSummary; token?: string }
        | undefined;
    PaymentCardSelect: { paymentId?: number | string } | undefined;
    PaymentPin: PaymentPinRouteParams | undefined;
    // [fe] 조보름 260528 1050 |   KAN-1151 카드결제 화면 브랜치 병합 후 연결 예정
    /*PaymentMethodSelect: undefined;*/
    CardManualRegister: undefined;
};

const linking: LinkingOptions<RootStackParamList> = {
    prefixes: ['http://localhost:19000'],
    config: {
        screens: {
            Main: '',
            Guide: 'guide',
            QrScan: 'qr-scan',
            CardManualRegister: 'card-register',
            PaymentMethodSelect: 'payment/method-select',
            PaymentCardSelect: 'payment/card-select',
            PaymentPin: 'payment/pin',
        },
    },
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
    const { width } = useWindowDimensions();
    const hasShownMobileOnlyAlert = useRef(false);

    useEffect(() => {
        if (width < 768) {
            hasShownMobileOnlyAlert.current = false;
            return;
        }

        if (hasShownMobileOnlyAlert.current) {
            return;
        }

        hasShownMobileOnlyAlert.current = true;

        Alert.alert('안내', '모바일로 이용해주세요.');
    }, [width]);

    return (
        <SafeAreaProvider>
            <View className="flex-1 bg-neutral-white">
                <NavigationContainer linking={linking}>
                    <Stack.Navigator
                        initialRouteName="Main"
                        screenOptions={{ headerShown: false }}
                    >
                        <Stack.Screen
                            name="Main"
                            component={MainScreen}
                            options={{ title: '메인' }}
                        />

                        <Stack.Screen
                            name="Guide"
                            component={GuideScreen}
                            options={{ title: 'IA 가이드' }}
                        />

                        {/*[fe] 조보름 260528 1050 |   KAN-1151 카드결제 화면 브랜치 병합 후 연결 예정*/}
                        {/*<Stack.Screen*/}
                        {/*    name="PaymentMethodSelect"*/}
                        {/*    component={PaymentMethodSelectScreen}*/}
                        {/*.   options={{ headerShown: false }}*/}
                        {/*/>*/}

                        <Stack.Screen
                            name="CardManualRegister"
                            component={CardManualRegisterScreen}
                        />

                        <Stack.Screen
                            name="QrScan"
                            component={QrScanScreen}
                        />

                        <Stack.Screen
                            name="PaymentMethodSelect"
                            component={PaymentMethodSelectScreen}
                        />

                        <Stack.Screen
                            name="PaymentCardSelect"
                            component={PaymentCardSelectScreen}
                        />

                        <Stack.Screen
                            name="PaymentPin"
                            component={PaymentPinScreen}
                        />

                        {/*
                        // [FE] 조보름 260529 0100 | 추후 마이페이지 연결
                        <Stack.Screen
                            name="MypageHomeScreen"
                            component={MypageHomeScreen}
                            options={{ headerShown: false }}
                        />*/}
                    </Stack.Navigator>
                </NavigationContainer>
            </View>
        </SafeAreaProvider>
    );
}
