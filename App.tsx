import './global.css';

import { useEffect, useRef } from 'react';
import { Alert, useWindowDimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import GuideScreen from './src/app/screens/GuideScreen';
import CardManualRegisterScreen from './src/features/card/screens/CardManualRegisterScreen';
import MainScreen from './src/features/main/screens/MainScreen';
// [fe] 조보름 260528 1050 |   KAN-1151 카드결제 화면 브랜치 병합 후 연결 예정
// import PaymentMethodSelectScreen from './src/features/payment/screens/PaymentMethodSelectScreen';

export type RootStackParamList = {
    Main: undefined;
    Guide: undefined;
    // [fe] 조보름 260528 1050 |   KAN-1151 카드결제 화면 브랜치 병합 후 연결 예정
    /*PaymentMethodSelect: undefined;*/
    CardManualRegister: undefined;
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
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Main">
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
                {/*    options={{ title: '카드결제' }}*/}
                {/*/>*/}

                <Stack.Screen
                    name="CardManualRegister"
                    component={CardManualRegisterScreen}
                    options={{ title: '카드 등록' }}
                />

                {/*
                // [FE] 조보름 260529 0100 | 추후 마이페이지 연결
                <Stack.Screen
                    name="MypageHomeScreen"
                    component={MypageHomeScreen}
                    options={{ title: '마이페이지' }}
                />*/}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
