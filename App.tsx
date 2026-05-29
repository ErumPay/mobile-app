import './global.css';
import { useState } from 'react';

import { useEffect, useRef } from 'react';
import { Alert, useWindowDimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import GuideScreen from './src/app/screens/GuideScreen';
import MainScreen from './src/app/screens/MainScreen';
import CardManualRegisterScreen from './src/features/card/screens/CardManualRegisterScreen';
// [fe] 조보름 260528 1050 |   KAN-1151 카드결제 화면 브랜치 병합 후 연결 예정
// import PaymentMethodSelectScreen from './src/features/payment/screens/PaymentMethodSelectScreen';

import MypageHomeScreen from './src/features/mypage/screens/MypageHomeScreen';


import CardDetailScreen from './src/features/mypage/screens/CardDetailScreen';
import CardManagementScreen, {
  mockManagedCards,
  type ManagedCard,
} from './src/features/mypage/screens/CardManagementScreen';
import PaymentDetailScreen from './src/features/mypage/screens/PaymentDetailScreen';
import PaymentHistoryScreen from './src/features/mypage/screens/PaymentHistoryScreen';
import ProfileConfirmScreen from './src/features/mypage/screens/ProfileConfirmScreen';





export type RootStackParamList = {
    Main: undefined;
    Guide: undefined;
    // [fe] 조보름 260528 1050 |   KAN-1151 카드결제 화면 브랜치 병합 후 연결 예정
    /*PaymentMethodSelect: undefined;*/
    CardManualRegister: undefined;
    CardDetailScreen: {
        cardId: string;
    };
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

    const [managedCards, setManagedCards] = useState<ManagedCard[]>(mockManagedCards);
    
    const handleDeleteCard = (deletedCardId: string) => {
        setManagedCards((currentCards) =>
            currentCards.filter((card) => card.id !== deletedCardId)
        );
    };

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
                <Stack.Screen name="CardManualRegister" options={{ title: '카드 등록' }}>
                    {({ navigation }) => (
                        <CardManualRegisterScreen
                            onClose={() => navigation.goBack()}
                            onGoCardManagement={() => navigation.navigate('CardManagementScreen')}
                            onCardRegistered={(registeredCard) => {
                                setManagedCards((currentCards) => [
                                ...currentCards,
                                {
                                    id: registeredCard.id,
                                    issuer: registeredCard.issuer,
                                    title: `${registeredCard.issuer}카드 (${registeredCard.last4})`,
                                    name: 'Simple Plan+',
                                    alias: registeredCard.cardNickname || '별칭미설정',
                                    colorClassName: 'bg-blue-600',
                                    isDefault: currentCards.length === 0,
                                },
                            ]);
                            }}
                        />
                    )}
                    </Stack.Screen>
                <Stack.Screen
                    name="MypageHomeScreen"
                    component={MypageHomeScreen}
                    options={{ title: '마이페이지' }}
                />*/}
                />
                <Stack.Screen
                    name="CardDetailScreen"
                    component={CardDetailScreen}
                    options={{ title: '카드 상세' }}
                    />
                <Stack.Screen name="CardManagementScreen" options={{ title: '카드 관리' }}>
                    {({ navigation }) => (
                        <CardManagementScreen
                        cards={managedCards}
                        onAddCard={() => navigation.navigate('CardManualRegister')}
                        onPressCard={(card: ManagedCard) =>
                            navigation.navigate('CardDetailScreen', {
                                cardId: card.id,
                            })
                        }
                        />
                    )}
                    </Stack.Screen>

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
