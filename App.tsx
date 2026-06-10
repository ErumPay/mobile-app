import './global.css';

import { useEffect, useRef, useState } from 'react';
import { Alert, useWindowDimensions, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, type LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';

import GuideScreen from './src/app/screens/GuideScreen';
import TutorialScreen from './src/features/auth/screens/TutorialScreen';
import TermsAgreementScreen from './src/features/auth/screens/TermsAgreementScreen';
import SmsVerificationScreen from './src/features/auth/screens/SmsVerificationScreen';
import SignupCompleteScreen from './src/features/auth/screens/SignupCompleteScreen';
import CardRegisterScreen from './src/features/card/screens/CardRegisterScreen';
import MainScreen from './src/features/main/screens/MainScreen';
import QrScanScreen from './src/features/qr/screens/QrScanScreen';
import PaymentMethodSelectScreen from './src/features/payment/screens/PaymentMethodSelectScreen';
import PaymentCardSelectScreen from './src/features/payment/screens/PaymentCardSelectScreen';
import type { PaymentCardFlowType } from './src/features/payment/types/paymentCard.types';
import PaymentPinScreen from './src/features/payment/screens/PaymentPinScreen';
import type { PaymentPinRouteParams } from './src/features/payment/types/paymentPin.types';
import PaymentResultScreen from './src/features/payment/screens/PaymentResultScreen';
import type { PaymentResultRouteParams } from './src/features/payment/types/paymentResult.types';
import PaymentCancelScreen from './src/features/payment/screens/PaymentCancelScreen';
import type { PaymentCancelRouteParams } from './src/features/payment/types/paymentCancel.types';
import OfflinePaymentQrScreen from './src/features/payment/screens/OfflinePaymentQrScreen';
import type { OfflinePaymentQrRouteParams } from './src/features/payment/types/offlinePaymentQr.types';
import type { PaymentRequestSummary } from './src/features/payment/types/paymentMethod.types';
import DutchPayGroupScreen from './src/features/payment/screens/DutchPayGroupScreen';
import type { DutchPayGroupRouteParams } from './src/features/payment/types/dutchPay.types';
import DutchPayInviteAcceptScreen from './src/features/payment/screens/DutchPayInviteAcceptScreen';
import PaymentParticipantSelectScreen from './src/features/payment/screens/PaymentParticipantSelectScreen';
import type { ParticipantSelectRouteParams } from './src/features/payment/types/paymentParticipantSelect.types';
import MypageHomeScreen from './src/features/mypage/screens/MypageHomeScreen';
import CardDetailScreen from './src/features/mypage/screens/CardDetailScreen';
import CardManagementScreen from './src/features/mypage/screens/CardManagementScreen';
import PaymentDetailScreen from './src/features/mypage/screens/PaymentDetailScreen';
import PaymentHistoryScreen from './src/features/mypage/screens/PaymentHistoryScreen';
import ProfileConfirmScreen from './src/features/mypage/screens/ProfileConfirmScreen';
import NotificationScreen from './src/features/notification/screens/NotificationScreen';
import FriendListScreen from './src/features/friend/screens/FriendListScreen';
import FriendInviteAcceptScreen from './src/features/friend/screens/FriendInviteAcceptScreen';
import { loadAuthSession } from './src/features/auth/api/authApi';

export type PaymentCardSelectRouteParams =
  | {
      paymentId?: number | string;
      remoteRequestId?: number | string;
      amount?: number | string;
      flow?: PaymentCardFlowType;
      idempotencyKey?: string;
      dutchSessionId?: number;
      selectedUserIds?: number[];
      splitMethod?: 'EQUAL' | 'CUSTOM';
      orderName?: string;
      merchantId?: number;
    }
  | undefined;

export type CardRegisterRouteParams =
  | {
      returnTo?: 'PaymentCardSelect';
      paymentCardSelectParams?: PaymentCardSelectRouteParams;
    }
  | undefined;

export type RootStackParamList = {
  Tutorial: undefined;
  Main: { userId?: number | string } | undefined;
  Guide: undefined;
  TermsAgreement: { accessToken: string };
  SmsVerification: { flow?: 'SIGNUP' | 'PIN_RESET' } | undefined;
  SignupComplete: undefined;
  QrScan: undefined;
  PaymentMethodSelect:
    | {
        remoteRequestId?: string;
        summary?: PaymentRequestSummary;
        token?: string;
      }
    | undefined;
  PaymentCardSelect: PaymentCardSelectRouteParams;
  PaymentPin: PaymentPinRouteParams | undefined;
  CardRegister: CardRegisterRouteParams;
  PaymentResult: PaymentResultRouteParams | undefined;
  PaymentCancel: PaymentCancelRouteParams | undefined;
  OfflinePaymentQr: OfflinePaymentQrRouteParams | undefined;
  DutchPayGroup: DutchPayGroupRouteParams | undefined;
  DutchPayInviteAccept: { inviteToken: string };
  PaymentParticipantSelect: ParticipantSelectRouteParams | undefined;
  MypageHomeScreen: undefined;
  ProfileConfirmScreen: undefined;
  CardManagementScreen: undefined;
  CardDetailScreen: { cardId: string };
  PaymentHistoryScreen: undefined;
  PaymentDetailScreen: { paymentId: string };
  NotificationScreen: undefined;
  FriendListScreen: undefined;
  FriendInviteAccept: { inviteToken: string };
};

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/'), 'erumpay://', 'http://localhost:19000'],
  config: {
    screens: {
      Tutorial: 'tutorial',
      Main: '',
      Guide: 'guide',
      TermsAgreement: 'auth/terms',
      SmsVerification: 'auth/sms-verification',
      SignupComplete: 'auth/signup-complete',
      QrScan: 'qr-scan',
      CardRegister: 'card-register',
      PaymentMethodSelect: 'payment/method-select',
      PaymentCardSelect: 'payment/card-select',
      PaymentPin: 'payment/pin',
      PaymentResult: 'payment/result',
      PaymentCancel: 'payment/cancel',
      OfflinePaymentQr: 'payment/offline-qr',
      DutchPayGroup: 'payment/dutch-pay-group',
      DutchPayInviteAccept: 'payment/dutch-pay-invite/:inviteToken',
      PaymentParticipantSelect: 'payment/participant-select',
      MypageHomeScreen: 'mypage',
      ProfileConfirmScreen: 'mypage/profile',
      CardManagementScreen: 'mypage/cards',
      CardDetailScreen: 'mypage/cards/:cardId',
      PaymentHistoryScreen: 'mypage/payments',
      PaymentDetailScreen: 'mypage/payments/:paymentId',
      NotificationScreen: 'notification',
      FriendListScreen: 'friend/list',
      FriendInviteAccept: 'friends/invite/:inviteToken',
    },
  },
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const { width } = useWindowDimensions();
  const hasShownMobileOnlyAlert = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Tutorial');

  useEffect(() => {
    loadAuthSession()
      .then((hasSession) => {
        if (hasSession) {
          setInitialRoute('Main');
        }
      })
      .catch(() => {})
      .finally(() => setIsReady(true));
  }, []);

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

  if (!isReady) return null;

  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-neutral-white">
        <NavigationContainer linking={linking}>
          <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Tutorial" component={TutorialScreen} />
            <Stack.Screen name="Main" component={MainScreen} />
            <Stack.Screen name="Guide" component={GuideScreen} />
            <Stack.Screen name="TermsAgreement" component={TermsAgreementScreen} />
            <Stack.Screen name="SmsVerification" component={SmsVerificationScreen} />
            <Stack.Screen name="SignupComplete" component={SignupCompleteScreen} />
            <Stack.Screen name="CardRegister" component={CardRegisterScreen} />
            <Stack.Screen name="QrScan" component={QrScanScreen} />
            <Stack.Screen name="PaymentMethodSelect" component={PaymentMethodSelectScreen} />
            <Stack.Screen name="PaymentCardSelect" component={PaymentCardSelectScreen} />
            <Stack.Screen name="PaymentPin" component={PaymentPinScreen} />
            <Stack.Screen name="PaymentResult" component={PaymentResultScreen} />
            <Stack.Screen name="PaymentCancel" component={PaymentCancelScreen} />
            <Stack.Screen name="OfflinePaymentQr" component={OfflinePaymentQrScreen} />
            <Stack.Screen name="DutchPayGroup" component={DutchPayGroupScreen} />
            <Stack.Screen name="DutchPayInviteAccept" component={DutchPayInviteAcceptScreen} />
            <Stack.Screen name="PaymentParticipantSelect" component={PaymentParticipantSelectScreen} />
            <Stack.Screen name="MypageHomeScreen" component={MypageHomeScreen} />
            <Stack.Screen name="ProfileConfirmScreen" component={ProfileConfirmScreen} />
            <Stack.Screen name="PaymentHistoryScreen" component={PaymentHistoryScreen} />
            <Stack.Screen name="PaymentDetailScreen" component={PaymentDetailScreen} />
            <Stack.Screen name="CardManagementScreen" component={CardManagementScreen} />
            <Stack.Screen name="CardDetailScreen" component={CardDetailScreen} />

            <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
            <Stack.Screen name="FriendListScreen" component={FriendListScreen} />
            <Stack.Screen name="FriendInviteAccept" component={FriendInviteAcceptScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}
