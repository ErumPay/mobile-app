import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainScreen from './src/app/screens/MainScreen';
import CardManualRegisterScreen from './src/features/card/screens/CardManualRegisterScreen';
// import PaymentMethodSelectScreen from './src/features/payment/screens/PaymentMethodSelectScreen';

export type RootStackParamList = {
    Main: undefined;
    PaymentMethodSelect: undefined;
    CardManualRegister: undefined;
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
            </Stack.Navigator>
        </NavigationContainer>
    );
}