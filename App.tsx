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
import PaymentPinScreen from "./src/features/payment/screens/PaymentPinScreen";
import type { PaymentPinRouteParams } from "./src/features/payment/types/paymentPin.types";
import PaymentResultScreen from "./src/features/payment/screens/PaymentResultScreen";
import type { PaymentResultRouteParams } from "./src/features/payment/types/paymentResult.types";
import PaymentCancelScreen from "./src/features/payment/screens/PaymentCancelScreen";
import type { PaymentCancelRouteParams } from "./src/features/payment/types/paymentCancel.types";
import type { PaymentRequestSummary } from "./src/features/payment/types/paymentMethod.types";
import DutchPayGroupScreen from "./src/features/payment/screens/DutchPayGroupScreen";
import type { DutchPayGroupRouteParams } from "./src/features/payment/types/dutchPay.types";
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
        summary?: PaymentRequestSummary;
        token?: string;
      }
    | undefined;
  PaymentCardSelect:
    | {
        paymentId?: number | string;
        amount?: number | string;
      }
    | undefined;
  PaymentPin: PaymentPinRouteParams | undefined;
  CardRegister: undefined;
  PaymentResult: PaymentResultRouteParams | undefined;
  PaymentCancel: PaymentCancelRouteParams | undefined;
  DutchPayGroup: DutchPayGroupRouteParams | undefined;
  MypageHomeScreen: undefined;
  ProfileConfirmScreen: undefined;
  CardManagementScreen: undefined;
  CardDetailScreen: { cardId: string };
  PaymentHistoryScreen: undefined;
  PaymentDetailScreen: { paymentId: string };
  PhoneVerificationScreen: undefined;
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
      DutchPayGroup: "payment/dutch-pay-group",
      MypageHomeScreen: "mypage",
      ProfileConfirmScreen: "mypage/profile",
      CardManagementScreen: "mypage/cards",
      CardDetailScreen: "mypage/cards/:cardId",
      PaymentHistoryScreen: "mypage/payments",
      PaymentDetailScreen: "mypage/payments/:paymentId",
    },
  },
};