import './global.css';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainScreen from './src/app/screens/MainScreen';
import CardManualRegisterScreen from './src/features/card/screens/CardManualRegisterScreen';
// [fe] 조보름 260528 1050 |   KAN-1151 카드결제 화면 브랜치 병합 후 연결 예정
// import PaymentMethodSelectScreen from './src/features/payment/screens/PaymentMethodSelectScreen';

import MypageHomeScreen from './src/features/mypage/screens/MypageHomeScreen';


import CardDetailScreen from './src/features/mypage/screens/CardDetailScreen';
import CardManagementScreen from './src/features/mypage/screens/CardManagementScreen';
import PaymentDetailScreen from './src/features/mypage/screens/PaymentDetailScreen';
import PaymentHistoryScreen from './src/features/mypage/screens/PaymentHistoryScreen';
import ProfileConfirmScreen from './src/features/mypage/screens/ProfileConfirmScreen';





export type RootStackParamList = {
    Main: undefined;
    // [fe] 조보름 260528 1050 |   KAN-1151 카드결제 화면 브랜치 병합 후 연결 예정
    /*PaymentMethodSelect: undefined;*/
    CardManualRegister: undefined;
    CardDetailScreen: undefined;
    CardManagementScreen: undefined;
    MypageHomeScreen: undefined;
    PaymentDetailScreen: {
        paymentId: string;
        };
    PaymentHistoryScreen: undefined;
    ProfileConfirmScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Main">
                <Stack.Screen
                    name="Main"
                    component={MainScreen}
                    options={{ title: '메인' }}
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
                <Stack.Screen
                    name="MypageHomeScreen"
                    component={MypageHomeScreen}
                    options={{ title: '마이페이지' }}
                />
                <Stack.Screen
                    name="CardDetailScreen"
                    component={CardDetailScreen}
                    options={{ title: '카드 상세' }}
                    />
                <Stack.Screen
                    name="CardManagementScreen"
                    component={CardManagementScreen}
                    options={{ title: '카드 관리' }}
                    />

                    <Stack.Screen
                    name="PaymentDetailScreen"
                    component={PaymentDetailScreen}
                    options={{ title: '결제 상세' }}
                    />

                    <Stack.Screen
                    name="PaymentHistoryScreen"
                    component={PaymentHistoryScreen}
                    options={{ title: '결제 내역' }}
                    />

                    <Stack.Screen
                    name="ProfileConfirmScreen"
                    component={ProfileConfirmScreen}
                    options={{ title: '내정보 확인' }}
                    />
            </Stack.Navigator>
        </NavigationContainer>
    );
}