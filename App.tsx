import "./global.css";

import { useEffect, useRef } from "react";
import { Alert, useWindowDimensions, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  NavigationContainer,
  type LinkingOptions,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import GuideScreen from "./src/app/screens/GuideScreen";
import CardRegisterScreen from "./src/features/card/screens/CardRegisterScreen";
import MainScreen from "./src/features/main/screens/MainScreen";
import QrScanScreen from "./src/features/qr/screens/QrScanScreen";
import PaymentMethodSelectScreen from "./src/features/payment/screens/PaymentMethodSelectScreen";
import PaymentCardSelectScreen from "./src/features/payment/screens/PaymentCardSelectScreen";
import type { PaymentCardFlowType } from "./src/features/payment/types/paymentCard.types";
import PaymentPinScreen from "./src/features/payment/screens/PaymentPinScreen";
import type { PaymentPinRouteParams } from "./src/features/payment/types/paymentPin.types";
import PaymentResultScreen from "./src/features/payment/screens/PaymentResultScreen";
import type { PaymentResultRouteParams } from "./src/features/payment/types/paymentResult.types";
import PaymentCancelScreen from "./src/features/payment/screens/PaymentCancelScreen";
import type { PaymentCancelRouteParams } from "./src/features/payment/types/paymentCancel.types";
import OfflinePaymentQrScreen from "./src/features/payment/screens/OfflinePaymentQrScreen";
import type { OfflinePaymentQrRouteParams } from "./src/features/payment/types/offlinePaymentQr.types";
import type { PaymentRequestSummary } from "./src/features/payment/types/paymentMethod.types";
import MypageHomeScreen from "./src/features/mypage/screens/MypageHomeScreen";
import CardDetailScreen from "./src/features/mypage/screens/CardDetailScreen";
import CardManagementScreen from "./src/features/mypage/screens/CardManagementScreen";
import PaymentDetailScreen from "./src/features/mypage/screens/PaymentDetailScreen";
import PaymentHistoryScreen from "./src/features/mypage/screens/PaymentHistoryScreen";
import ProfileConfirmScreen from "./src/features/mypage/screens/ProfileConfirmScreen";

export type RootStackParamList = {
  Main: undefined;
  Guide: undefined;
  QrScan: undefined;
  PaymentMethodSelect:
    | {
        remoteRequestId?: string;
        summary?: PaymentRequestSummary;
        token?: string;
      }
    | undefined;
  PaymentCardSelect:
    | {
        paymentId?: number | string;
        amount?: number | string;
        flow?: PaymentCardFlowType;
        idempotencyKey?: string;
        dutchSessionId?: number;
        selectedUserIds?: number[];
        splitMethod?: "EQUAL" | "CUSTOM";
        orderName?: string;
        merchantId?: number;
      }
    | undefined;
  PaymentPin: PaymentPinRouteParams | undefined;
  CardRegister: undefined;
  PaymentResult: PaymentResultRouteParams | undefined;
  PaymentCancel: PaymentCancelRouteParams | undefined;
  OfflinePaymentQr: OfflinePaymentQrRouteParams | undefined;
  MypageHomeScreen: undefined;
  ProfileConfirmScreen: undefined;
  CardManagementScreen: undefined;
  CardDetailScreen: { cardId: string };
  PaymentHistoryScreen: undefined;
  PaymentDetailScreen: { paymentId: string };
};

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ["http://localhost:19000"],
  config: {
    screens: {
      Main: "",
      Guide: "guide",
      QrScan: "qr-scan",
      CardRegister: "card-register",
      PaymentMethodSelect: "payment/method-select",
      PaymentCardSelect: "payment/card-select",
      PaymentPin: "payment/pin",
      PaymentResult: "payment/result",
      PaymentCancel: "payment/cancel",
      OfflinePaymentQr: "payment/offline-qr",
      MypageHomeScreen: "mypage",
      ProfileConfirmScreen: "mypage/profile",
      CardManagementScreen: "mypage/cards",
      CardDetailScreen: "mypage/cards/:cardId",
      PaymentHistoryScreen: "mypage/payments",
      PaymentDetailScreen: "mypage/payments/:paymentId",
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

    Alert.alert("안내", "모바일로 이용해주세요.");
  }, [width]);

  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-neutral-white">
        <NavigationContainer linking={linking}>
          <Stack.Navigator
            initialRouteName="Main"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="Main" component={MainScreen} />
            <Stack.Screen name="Guide" component={GuideScreen} />
            <Stack.Screen name="CardRegister" component={CardRegisterScreen} />
            <Stack.Screen name="QrScan" component={QrScanScreen} />

            <Stack.Screen
              name="PaymentMethodSelect"
              component={PaymentMethodSelectScreen}
            />

            <Stack.Screen
              name="PaymentCardSelect"
              component={PaymentCardSelectScreen}
            />

            <Stack.Screen name="PaymentPin" component={PaymentPinScreen} />
            <Stack.Screen name="PaymentResult" component={PaymentResultScreen} />
            <Stack.Screen name="PaymentCancel" component={PaymentCancelScreen} />
            <Stack.Screen
              name="OfflinePaymentQr"
              component={OfflinePaymentQrScreen}
            />

            <Stack.Screen
              name="MypageHomeScreen"
              component={MypageHomeScreen}
            />

            <Stack.Screen
              name="ProfileConfirmScreen"
              component={ProfileConfirmScreen}
            />

            <Stack.Screen
              name="PaymentHistoryScreen"
              component={PaymentHistoryScreen}
            />

            <Stack.Screen
              name="PaymentDetailScreen"
              component={PaymentDetailScreen}
            />

            <Stack.Screen
              name="CardManagementScreen"
              component={CardManagementScreen}
            />

            <Stack.Screen
              name="CardDetailScreen"
              component={CardDetailScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}
