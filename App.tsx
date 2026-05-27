import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import './global.css';
import {
  CardDetailScreen,
  CardManagementScreen,
  MypageHomeScreen,
  PaymentDetailScreen,
  PaymentHistoryScreen,
  ProfileConfirmScreen,
} from './src/features/mypage';

type RootStackParamList = {
  MypageHome: undefined;
  ProfileConfirm: undefined;
  CardManagement: undefined;
  CardDetail: undefined;
  PaymentHistory: undefined;
  PaymentDetail: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MypageHome"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="MypageHome">
          {({ navigation }) => (
            <MypageHomeScreen
              onBack={navigation.goBack}
              onPressProfile={() => navigation.navigate('ProfileConfirm')}
              onPressHistory={() => navigation.navigate('PaymentHistory')}
              onPressCard={() => navigation.navigate('CardManagement')}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="ProfileConfirm">
          {({ navigation }) => (
            <ProfileConfirmScreen onBack={navigation.goBack} />
          )}
        </Stack.Screen>
        <Stack.Screen name="CardManagement">
          {({ navigation }) => (
            <CardManagementScreen
              onBack={navigation.goBack}
              onPressCard={() => navigation.navigate('CardDetail')}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="PaymentHistory">
          {({ navigation }) => (
            <PaymentHistoryScreen
              onBack={navigation.goBack}
              onPressItem={() => navigation.navigate('PaymentDetail')}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="PaymentDetail">
          {({ navigation }) => (
            <PaymentDetailScreen onBack={navigation.goBack} />
          )}
        </Stack.Screen>
        <Stack.Screen name="CardDetail">
        {({ navigation }) => (
          <CardDetailScreen onBack={navigation.goBack} />
        )}
      </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
