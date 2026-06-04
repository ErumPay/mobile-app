import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Svg, { Circle, Line, Path, Rect } from "react-native-svg";

import type { RootStackParamList } from "../../../../App";
import {
  PaymentProgressCard,
  PaymentProgressCardSkeleton,
  type PaymentProgressVariant,
} from "../components/PaymentProgressCard";
import {
  MainBannerCarousel,
  type MainBannerId,
} from "../components/MainBannerCarousel";
import { MainHeader } from "../components/MainHeader";
import type { PaymentHistory } from "../components/RecentPaymentHistory";
import { RecentPaymentHistory } from "../components/RecentPaymentHistory";
import { FloatingButton } from "../../../shared/components/FloatingButton";
import { RejectConfirmModal } from "../../../shared/components/Modal";
import { PageWrap } from "../../../shared/components/PageWrap";
import { Skeleton } from "../../../shared/components/Skeleton";
import { mockPaymentRequestSummary } from "../../payment/constants/paymentMethod.mock";
import { useRemotePaymentProgressStore } from "../../payment/stores/useRemotePaymentProgressStore";

type Props = NativeStackScreenProps<RootStackParamList, "Main">;

type QuickMenu = {
  label: string;
  icon: "friends" | "card" | "history";
  toneClassName: string;
  iconColor: string;
  onPress?: () => void;
};

type RecentPaymentHistoryScenario = "EMPTY" | "ONE_ITEM" | "TWO_ITEMS";

const monthlyPayment = {
  month: new Date().getMonth() + 1,
  amount: "0원",
  remaining: "이번 달 받은 혜택 0원",
};

const recentPaymentHistoryScenario: RecentPaymentHistoryScenario = "TWO_ITEMS";

const recentPaymentHistoryFixtures: Record<
  RecentPaymentHistoryScenario,
  PaymentHistory[]
> = {
  EMPTY: [],
  ONE_ITEM: [
    {
      id: 1,
      merchantName: "이룸카페",
      cardName: "현대카드",
      cardNumber: "1123 **** **** 2232",
      amount: "12,000원",
      paidAt: "오늘",
    },
  ],
  TWO_ITEMS: [
    {
      id: 1,
      merchantName: "이룸카페",
      cardName: "현대카드",
      cardNumber: "1123 **** **** 2232",
      amount: "12,000원",
      paidAt: "오늘",
    },
    {
      id: 2,
      merchantName: "이룸마트",
      cardName: "신한카드",
      cardNumber: "4455 **** **** 9012",
      amount: "31,500원",
      paidAt: "어제",
    },
  ],
};

const paymentHistories =
  recentPaymentHistoryFixtures[recentPaymentHistoryScenario];

const hasActivePaymentProgress = false;
const hasNotification = false;
const activePaymentProgressVariant: PaymentProgressVariant =
  "DUTCHPAY_OWNER_AMOUNT_CONFIRM_READY";
const isPaymentProgressLoading = false;
const isMonthlyPaymentLoading = false;
const isNotificationLoading = false;
const isPaymentHistoryLoading = false;

const paymentMethodSelectParams = {
  summary: mockPaymentRequestSummary,
};

export default function MainScreen({ navigation }: Props) {
  const remoteProgress = useRemotePaymentProgressStore((state) => state.progress);
  const remoteProgressVariant = useRemotePaymentProgressStore((state) =>
    state.getProgressVariant(),
  );
  const acceptRemoteRequest = useRemotePaymentProgressStore(
    (state) => state.acceptRequest,
  );
  const rejectRemoteRequest = useRemotePaymentProgressStore(
    (state) => state.rejectRequest,
  );
  const recipientSummary = useRemotePaymentProgressStore((state) =>
    state.getRecipientSummary(),
  );
  const paymentProgressVariant =
    remoteProgressVariant ?? activePaymentProgressVariant;
  const hasVisiblePaymentProgress =
    hasActivePaymentProgress || !!remoteProgress;
  const hasRemoteNotification =
    remoteProgress?.role === "RECIPIENT" && remoteProgress.status === "REQUESTED";
  const [isRejectConfirmVisible, setIsRejectConfirmVisible] = useState(false);

  const quickMenus: QuickMenu[] = [
    {
      label: "친구관리",
      icon: "friends",
      toneClassName: "bg-[#D8EAFF]",
      iconColor: "#1677FF",
    },
    {
      label: "카드관리",
      icon: "card",
      toneClassName: "bg-[#FFE6C7]",
      iconColor: "#F06423",
      onPress: () => navigation.navigate("CardManagementScreen"),
    },
    {
      label: "결제내역",
      icon: "history",
      toneClassName: "bg-[#EEDCFF]",
      iconColor: "#8A2DFF",
      onPress: () => navigation.navigate("PaymentHistoryScreen"),
    },
  ];

  const handleRejectPaymentProgress = () => {
    if (paymentProgressVariant !== "REMOTE_INCOMING_REQUEST_RECEIVED") {
      return;
    }

    setIsRejectConfirmVisible(true);
  };

  const confirmRejectPaymentProgress = () => {
    rejectRemoteRequest();
    setIsRejectConfirmVisible(false);
  };

  const handlePressPaymentProgressPrimary = () => {
    if (paymentProgressVariant.startsWith("DUTCHPAY_")) {
      navigation.navigate("DutchPayGroup");
      return;
    }

    if (remoteProgress?.role === "RECIPIENT" && recipientSummary) {
      navigation.navigate("PaymentMethodSelect", {
        remoteRequestId: remoteProgress.requestId,
        summary: recipientSummary,
      });
      return;
    }

    navigation.navigate("PaymentMethodSelect", paymentMethodSelectParams);
  };

  const handlePressPaymentProgressAccept = () => {
    acceptRemoteRequest();

    if (recipientSummary) {
      navigation.navigate("PaymentMethodSelect", {
        remoteRequestId: remoteProgress?.requestId,
        summary: recipientSummary,
      });
      return;
    }

    navigation.navigate("PaymentMethodSelect", paymentMethodSelectParams);
  };

  const handlePressBanner = (id: MainBannerId) => {
    if (id === "card-recommendation") {
      navigation.navigate("PaymentMethodSelect", paymentMethodSelectParams);
      return;
    }

    if (id === "dutchpay") {
      navigation.navigate("DutchPayGroup");
      return;
    }

    navigation.navigate("PaymentParticipantSelect", {
      mode: "REMOTE_PAYMENT",
    });
  };

  return (
    <View className="flex-1 items-center bg-neutral-grey2">
      <View className="w-full flex-1 overflow-hidden bg-neutral-white">
        <PageWrap
          padded={false}
          backgroundClassName="bg-neutral-white"
          header={
            <>
              <View className="border-b border-neutral-grey1 bg-neutral-white px-5 py-3">
                <Pressable
                  accessibilityRole="button"
                  className="self-start rounded-full border border-neutral-grey1 px-3 py-2"
                  onPress={() => navigation.navigate("Guide")}
                >
                  <Text className="font-pretendard text-normal-bold text-erum-secondary">
                    IA 가이드 보기
                  </Text>
                </Pressable>
              </View>
              <MainHeader
                hasNotification={hasNotification || hasRemoteNotification}
                isNotificationLoading={isNotificationLoading}
              />
            </>
          }
        >
          <View className="bg-neutral-white px-5 pb-40">
            <View className="mt-10">
              <Text className="font-pretendard text-heading-3 text-neutral-black1">
                안녕하세요,
              </Text>
              <Text className="mt-1 font-pretendard text-large-regular text-neutral-black2">
                나이룸(1234)님! 오늘도 좋은 하루 되세요 ✨
              </Text>
            </View>

            <View className="mt-10 overflow-hidden rounded-xl bg-erum-secondary px-4 pb-4 pt-5 shadow-sm">
              <Pressable
                accessibilityRole="button"
                className="items-center"
                onPress={() => navigation.navigate("QrScan")}
              >
                <View className="h-[78px] w-[78px] items-center justify-center rounded-xl bg-neutral-white">
                  <Image
                    accessibilityLabel="QR 결제 아이콘"
                    resizeMode="contain"
                    source={require("../../../assets/images/qr-code.png")}
                    style={{ width: 60, height: 60 }}
                  />
                </View>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                className="mt-5 h-10 flex-row items-center justify-center rounded-lg bg-[#5CA28E]"
                onPress={() => navigation.navigate("CardRegister")}
              >
                <Text className="mr-1.5 text-[18px] leading-[22px]">💳</Text>
                <Text className="font-pretendard text-normal-bold text-neutral-white">
                  카드를 등록하고 혜택을 받아보세요
                </Text>
              </Pressable>
            </View>

            {isPaymentProgressLoading || hasVisiblePaymentProgress ? (
              <View className="mt-10">
                {isPaymentProgressLoading ? (
                  <PaymentProgressCardSkeleton />
                ) : (
                  <PaymentProgressCard
                    participantName={remoteProgress?.participantName}
                    variant={paymentProgressVariant}
                    onPressAccept={handlePressPaymentProgressAccept}
                    onPressPrimary={handlePressPaymentProgressPrimary}
                    onPressReject={handleRejectPaymentProgress}
                  />
                )}
              </View>
            ) : null}

            <View className="mt-10 flex-row justify-between px-3">
              {quickMenus.map((menu) => (
                <QuickMenuButton key={menu.label} menu={menu} />
              ))}
            </View>

            <View className="mt-10">
              {isMonthlyPaymentLoading ? (
                <MonthlyPaymentCardSkeleton />
              ) : (
                <MonthlyPaymentCard />
              )}
            </View>
            <View className="mt-10">
              <RecentPaymentHistory
                histories={paymentHistories}
                isLoading={isPaymentHistoryLoading}
                onPressHistory={(history) =>
                  navigation.navigate("PaymentDetailScreen", {
                    paymentId: String(history.id),
                  })
                }
                onPressMore={() => navigation.navigate("PaymentHistoryScreen")}
              />
            </View>
            <View className="mt-10">
              <MainBannerCarousel onPressItem={handlePressBanner} />
            </View>
          </View>
        </PageWrap>

        <FloatingButton
          value="home"
          onChange={(value) => {
            if (value === "home") {
              return;
            }

            if (value === "payment") {
              navigation.navigate(
                "PaymentMethodSelect",
                paymentMethodSelectParams,
              );
              return;
            }

            if (value === "my") {
              navigation.navigate("MypageHomeScreen");
            }
          }}
        />
      </View>

      <RejectConfirmModal
        visible={isRejectConfirmVisible}
        onCancel={() => setIsRejectConfirmVisible(false)}
        onConfirm={confirmRejectPaymentProgress}
      />
    </View>
  );
}

function QuickMenuButton({ menu }: { menu: QuickMenu }) {
  return (
    <Pressable
      accessibilityRole="button"
      className="min-w-[72px] items-center"
      onPress={menu.onPress}
    >
      <View
        className={`h-[52px] w-[52px] items-center justify-center rounded-full ${menu.toneClassName}`}
      >
        <QuickMenuIcon color={menu.iconColor} name={menu.icon} />
      </View>
      <Text className="mt-3 font-pretendard text-large-bold text-neutral-black2">
        {menu.label}
      </Text>
    </Pressable>
  );
}

function MonthlyPaymentCard() {
  return (
    <View className="items-center rounded-xl bg-[#2F62A3] px-5 py-4 shadow-sm">
      <View className="flex-row items-center rounded-full bg-[#5F88BF] px-4 py-2">
        <Text className="mr-1 text-[13px] leading-[14px]">💰</Text>
        <Text className="font-pretendard text-normal-bold text-neutral-white">
          {monthlyPayment.month}월 결제 금액
        </Text>
      </View>
      <Text className="mt-2 font-pretendard text-heading-2 text-neutral-white">
        {monthlyPayment.amount}
      </Text>
      <Text className="mt-1 font-pretendard text-large-regular text-[#DDEBFF]">
        {monthlyPayment.remaining}
      </Text>
    </View>
  );
}

function MonthlyPaymentCardSkeleton() {
  return (
    <View className="items-center rounded-xl bg-[#2F62A3] px-5 py-4 shadow-sm">
      <Skeleton width="38%" height={30} rounded="full" />
      <View className="mt-3 w-[48%]">
        <Skeleton width="100%" height={26} />
      </View>
      <View className="mt-2 w-[42%]">
        <Skeleton width="100%" height={14} />
      </View>
    </View>
  );
}

function QuickMenuIcon({
  color,
  name,
}: {
  color: string;
  name: QuickMenu["icon"];
}) {
  if (name === "friends") {
    return (
      <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
        <Circle cx={11} cy={9} r={3.2} stroke={color} strokeWidth={2.2} />
        <Path
          d="M5.5 21.5C6 17.8 8.1 16.1 11 16.1C13.9 16.1 16 17.8 16.5 21.5"
          stroke={color}
          strokeLinecap="round"
          strokeWidth={2.2}
        />
        <Circle cx={19} cy={11} r={2.5} stroke={color} strokeWidth={2} />
        <Path
          d="M17.3 16.6C19.8 16.8 21.4 18.3 21.8 21"
          stroke={color}
          strokeLinecap="round"
          strokeWidth={2}
        />
      </Svg>
    );
  }

  if (name === "card") {
    return (
      <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
        <Rect
          x={5}
          y={8}
          width={18}
          height={13}
          rx={2.5}
          stroke={color}
          strokeWidth={2.2}
        />
        <Line
          x1={7.2}
          x2={20.8}
          y1={12}
          y2={12}
          stroke={color}
          strokeWidth={2.2}
        />
      </Svg>
    );
  }

  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
      <Rect
        x={8}
        y={4.5}
        width={12}
        height={19}
        rx={2}
        stroke={color}
        strokeWidth={2.2}
      />
      <Line x1={11} x2={17} y1={9} y2={9} stroke={color} strokeWidth={2} />
      <Line x1={11} x2={17} y1={14} y2={14} stroke={color} strokeWidth={2} />
      <Line x1={11} x2={17} y1={19} y2={19} stroke={color} strokeWidth={2} />
    </Svg>
  );
}
