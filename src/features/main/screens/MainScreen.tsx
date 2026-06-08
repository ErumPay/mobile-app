import { useCallback, useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
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
} from "../components/MainBannerCarousel";
import { MainHeader } from "../components/MainHeader";
import type { PaymentHistory } from "../components/RecentPaymentHistory";
import { RecentPaymentHistory } from "../components/RecentPaymentHistory";
import { FloatingButton } from "../../../shared/components/FloatingButton";
import { RejectConfirmModal } from "../../../shared/components/Modal";
import { PageWrap } from "../../../shared/components/PageWrap";
import { Skeleton } from "../../../shared/components/Skeleton";
import {
  getActiveDutchPaySessions,
  type DutchPaySessionDetailResponse,
} from "../../payment/api/dutchPayApi";
import {
  getActiveRemotePaymentRequests,
  rejectRemotePaymentRequest,
} from "../../payment/api/remotePaymentApi";
import { getPaymentUserId } from "../../payment/api/paymentApiConfig";
import { getCancelledDutchPaySessionIdSet } from "../../payment/utils/cancelledDutchPaySessions";
import { useRemotePaymentProgressStore } from "../../payment/stores/useRemotePaymentProgressStore";
import { useDutchPayProgressUserStore } from "../../payment/stores/useDutchPayProgressUserStore";
import {
  fetchPaymentHistories,
  fetchUserProfile,
} from "../../mypage/api/mypageApi";
import type {
  PaymentHistoryItem,
  UserProfile,
} from "../../mypage/types/mypage";

type Props = NativeStackScreenProps<RootStackParamList, "Main">;

type ActiveDutchPayProgress = {
  role: "OWNER" | "PARTICIPANT";
  session: DutchPaySessionDetailResponse;
  variant: PaymentProgressVariant;
};

type QuickMenu = {
  label: string;
  icon: "friends" | "card" | "history";
  toneClassName: string;
  iconColor: string;
  onPress?: () => void;
};

const hasNotification = false;
const isNotificationLoading = false;

function resolvePaymentProgressUserId(
  routeUserId?: number | null,
  storedUserId?: number | null,
) {
  if (routeUserId != null) {
    return routeUserId;
  }

  if (storedUserId != null) {
    return storedUserId;
  }

  try {
    return toFiniteNumber(getPaymentUserId());
  } catch {
    return null;
  }
}

export default function MainScreen({ navigation, route }: Props) {
  const routeUserId = toFiniteNumber(route.params?.userId);
  const storedDutchPayProgressUserId = useDutchPayProgressUserStore(
    (state) => state.userId,
  );
  const paymentProgressUserId = resolvePaymentProgressUserId(
    routeUserId,
    storedDutchPayProgressUserId,
  );
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [monthlyPayment, setMonthlyPayment] = useState(() =>
    createMonthlyPayment([]),
  );
  const [paymentHistories, setPaymentHistories] = useState<PaymentHistory[]>([]);
  const [isMonthlyPaymentLoading, setIsMonthlyPaymentLoading] = useState(true);
  const [isPaymentHistoryLoading, setIsPaymentHistoryLoading] = useState(true);
  const [isPaymentProgressLoading, setIsPaymentProgressLoading] =
    useState(true);
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
  const setRequesterProgress = useRemotePaymentProgressStore(
    (state) => state.setRequesterProgress,
  );
  const setRecipientProgress = useRemotePaymentProgressStore(
    (state) => state.setRecipientProgress,
  );
  const clearRemoteProgress = useRemotePaymentProgressStore(
    (state) => state.clearProgress,
  );
  const [dutchProgress, setDutchProgress] =
    useState<ActiveDutchPayProgress | null>(null);
  const paymentProgressVariant =
    dutchProgress?.variant ?? remoteProgressVariant ?? undefined;
  const hasVisiblePaymentProgress =
    !!dutchProgress || (!!remoteProgress && !!paymentProgressVariant);
  const hasRemoteNotification =
    !dutchProgress &&
    remoteProgress?.role === "RECIPIENT" &&
    remoteProgress.status === "REQUESTED";
  const [isRejectConfirmVisible, setIsRejectConfirmVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetchUserProfile()
      .then((nextProfile) => {
        if (isMounted) {
          setProfile(nextProfile);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProfile(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    setIsPaymentHistoryLoading(true);
    fetchPaymentHistories()
      .then((payments) => {
        if (isMounted) {
          setPaymentHistories(payments.map(toMainPaymentHistory));
        }
      })
      .catch(() => {
        if (isMounted) {
          setPaymentHistories([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsPaymentHistoryLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    setIsMonthlyPaymentLoading(true);
    fetchPaymentHistories({ period: "MONTH", status: "PAID" })
      .then((payments) => {
        if (isMounted) {
          setMonthlyPayment(createMonthlyPayment(payments));
        }
      })
      .catch(() => {
        if (isMounted) {
          setMonthlyPayment(createMonthlyPayment([]));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsMonthlyPaymentLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadActivePaymentProgress = async (showLoading = false) => {
        if (showLoading) {
          setIsPaymentProgressLoading(true);
        }

        try {
          const currentUserId = paymentProgressUserId;
          if (currentUserId == null) {
            setDutchProgress(null);
            clearRemoteProgress();
            return;
          }

          const [dutchSessions, requests, cancelledDutchSessionIds] =
            await Promise.allSettled([
            getActiveDutchPaySessions(currentUserId),
            getActiveRemotePaymentRequests(),
            getCancelledDutchPaySessionIdSet(),
          ]);

          if (!isActive) {
            return;
          }

          if (dutchSessions.status === "fulfilled") {
            setDutchProgress(
              getActiveDutchPayProgress(
                dutchSessions.value,
                currentUserId,
                cancelledDutchSessionIds.status === "fulfilled"
                  ? cancelledDutchSessionIds.value
                  : new Set(),
              ),
            );
          } else {
            setDutchProgress(null);
          }

          if (requests.status !== "fulfilled") {
            clearRemoteProgress();
            return;
          }

          const incomingRequest = requests.value.find(
            (request) => Number(request.recipientUserId) === currentUserId,
          );
          const outgoingRequest = requests.value.find(
            (request) => Number(request.requesterUserId) === currentUserId,
          );

          if (incomingRequest) {
            setRecipientProgress(incomingRequest);
            return;
          }

          if (outgoingRequest) {
            setRequesterProgress(outgoingRequest);
            return;
          }

          clearRemoteProgress();
        } catch {
          // 메인 진입은 진행 결제 상태 조회 실패로 막지 않는다.
        } finally {
          if (isActive && showLoading) {
            setIsPaymentProgressLoading(false);
          }
        }
      };

      void loadActivePaymentProgress(true);
      const intervalId = setInterval(() => {
        void loadActivePaymentProgress();
      }, 30_000);

      return () => {
        isActive = false;
        clearInterval(intervalId);
      };
    }, [
      clearRemoteProgress,
      paymentProgressUserId,
      setRecipientProgress,
      setRequesterProgress,
    ]),
  );

  const quickMenus: QuickMenu[] = [
    {
      label: "친구관리",
      icon: "friends",
      toneClassName: "bg-[#D8EAFF]",
      iconColor: "#1677FF",
      onPress: () => navigation.navigate("FriendListScreen"),
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
    if (dutchProgress) {
      return;
    }

    if (paymentProgressVariant !== "REMOTE_INCOMING_REQUEST_RECEIVED") {
      return;
    }

    setIsRejectConfirmVisible(true);
  };

  const confirmRejectPaymentProgress = async () => {
    try {
      if (remoteProgress?.requestId) {
        await rejectRemotePaymentRequest(remoteProgress.requestId);
      }

      rejectRemoteRequest();
      setIsRejectConfirmVisible(false);
    } catch {
      setIsRejectConfirmVisible(false);
    }
  };

  const handlePressPaymentProgressPrimary = () => {
    if (dutchProgress) {
      if (dutchProgress.variant === "DUTCHPAY_OWNER_GROUP_CREATE_READY") {
        navigation.navigate("PaymentParticipantSelect", {
          mode: "DUTCH_PAY",
          dutchSessionId: dutchProgress.session.session_id,
          amount: dutchProgress.session.total_amount,
          orderName: dutchProgress.session.order_name,
          merchantId: dutchProgress.session.merchant_id,
        });
        return;
      }

      navigation.navigate("DutchPayGroup", {
        role: dutchProgress.role,
        scenario: getDutchPayRouteScenario(dutchProgress.variant),
        sessionId: dutchProgress.session.session_id,
        userId: paymentProgressUserId ?? undefined,
      });
      return;
    }

    if (remoteProgress?.role === "RECIPIENT" && recipientSummary) {
      navigation.navigate("PaymentMethodSelect", {
        remoteRequestId: remoteProgress.requestId,
        summary: recipientSummary,
      });
      return;
    }

    navigation.navigate("QrScan");
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

    navigation.navigate("QrScan");
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
                onPressNotification={() => navigation.navigate("NotificationScreen")}
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
                {formatGreeting(profile)}
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
                    participantName={
                      dutchProgress ? undefined : remoteProgress?.participantName
                    }
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
                <MonthlyPaymentCard monthlyPayment={monthlyPayment} />
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
              <MainBannerCarousel />
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
              navigation.navigate("QrScan");
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

function MonthlyPaymentCard({
  monthlyPayment,
}: {
  monthlyPayment: ReturnType<typeof createMonthlyPayment>;
}) {
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

function formatGreeting(profile: UserProfile | null) {
  if (!profile) {
    return "오늘도 좋은 하루 되세요 ✨";
  }

  const maskedId = profile.maskedId ? `(${profile.maskedId})` : "";

  return `${profile.name}${maskedId}님! 오늘도 좋은 하루 되세요 ✨`;
}

function toFiniteNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsedValue = Number(value);

    return Number.isFinite(parsedValue) ? parsedValue : undefined;
  }

  return undefined;
}

function getActiveDutchPayProgress(
  sessions: DutchPaySessionDetailResponse[],
  currentUserId: number,
  cancelledSessionIds: Set<number>,
): ActiveDutchPayProgress | null {
  for (const session of sessions) {
    const isMySession = session.participants.some(
      (participant) => participant.user_id === currentUserId,
    );

    if (!isMySession) {
      continue;
    }

    const role = session.host_user_id === currentUserId ? "OWNER" : "PARTICIPANT";
    const variant = toDutchPayProgressVariant(
      session,
      currentUserId,
      role,
      cancelledSessionIds.has(session.session_id),
    );

    if (variant) {
      return {
        role,
        session,
        variant,
      };
    }
  }

  return null;
}

function toDutchPayProgressVariant(
  session: DutchPaySessionDetailResponse,
  currentUserId: number,
  role: "OWNER" | "PARTICIPANT",
  isLocallyCancelled = false,
): PaymentProgressVariant | null {
  if (
    session.status === "COMPLETED" ||
    session.status === "FAILED" ||
    session.status === "TIMEOUT_HANDLED" ||
    session.session_progress_step === "COMPLETED" ||
    session.session_progress_step === "FAILED" ||
    session.session_progress_step === "TIMEOUT_HANDLED"
  ) {
    return null;
  }

  const hasParticipantBeyondOwner = session.participants.some(
    (participant) => participant.user_id !== session.host_user_id,
  );

  if (role === "OWNER" && isLocallyCancelled) {
    return null;
  }

  if (
    role === "OWNER" &&
    session.status === "CREATED" &&
    !hasParticipantBeyondOwner
  ) {
    return null;
  }

  if (role === "OWNER") {
    switch (session.session_progress_step) {
      case "GROUP_CREATED":
        return hasParticipantBeyondOwner
          ? "DUTCHPAY_OWNER_MEMBER_CONFIRM_READY"
          : "DUTCHPAY_OWNER_GROUP_CREATE_READY";
      case "PARTICIPANT_CONFIRM":
        return "DUTCHPAY_OWNER_MEMBER_CONFIRM_READY";
      case "AMOUNT_INPUT":
        return "DUTCHPAY_OWNER_AMOUNT_CONFIRM_READY";
      case "PAYMENT_REQUEST":
        return "DUTCHPAY_OWNER_WAITING_MEMBERS";
      case "PAYMENT_IN_PROGRESS":
        return "DUTCHPAY_OWNER_WAITING_MEMBERS";
      case "FINAL_PAYMENT_REQUIRED":
        return "DUTCHPAY_OWNER_FINAL_PAYMENT_READY";
      default:
        return null;
    }
  }

  const myParticipant = session.participants.find(
    (participant) => participant.user_id === currentUserId,
  );

  if (
    !myParticipant ||
    myParticipant.status === "REJECTED" ||
    myParticipant.status === "TIMEOUT"
  ) {
    return null;
  }

  if (myParticipant.status === "INVITED") {
    return "DUTCHPAY_MEMBER_REQUEST_RECEIVED";
  }

  if (myParticipant.status === "PAID" || myParticipant.status === "HOST_PAID") {
    return "DUTCHPAY_MEMBER_WAITING_OTHERS";
  }

  if (myParticipant.payment_id != null) {
    return "DUTCHPAY_MEMBER_WAITING_OTHERS";
  }

  if (session.session_progress_step === "AMOUNT_INPUT" && myParticipant.amount == null) {
    return "DUTCHPAY_MEMBER_AMOUNT_INPUT_READY";
  }

  if (myParticipant.amount != null) {
    return "DUTCHPAY_MEMBER_PAYMENT_READY";
  }

  return "DUTCHPAY_MEMBER_REQUEST_RECEIVED";
}

function getDutchPayRouteScenario(variant: PaymentProgressVariant) {
  switch (variant) {
    case "DUTCHPAY_OWNER_WAITING_MEMBERS":
      return "OWNER_PAYMENT_PROGRESS" as const;
    case "DUTCHPAY_OWNER_FINAL_PAYMENT_READY":
      return "OWNER_FINAL_PAYMENT_READY" as const;
    case "DUTCHPAY_OWNER_COMPLETED":
      return "OWNER_FINAL_PAYMENT_READY" as const;
    case "DUTCHPAY_MEMBER_AMOUNT_INPUT_READY":
      return "PARTICIPANT_AMOUNT_INPUT" as const;
    case "DUTCHPAY_MEMBER_PAYMENT_READY":
      return "PARTICIPANT_PAYMENT_REQUEST" as const;
    case "DUTCHPAY_MEMBER_WAITING_OTHERS":
      return "PARTICIPANT_PAYMENT_PROGRESS" as const;
    case "DUTCHPAY_MEMBER_COMPLETED":
      return "PARTICIPANT_FINAL_PAYMENT_PROGRESS" as const;
    default:
      return undefined;
  }
}

function createMonthlyPayment(payments: PaymentHistoryItem[]) {
  const totalAmount = payments
    .filter((payment) => payment.status === "completed")
    .reduce((sum, payment) => sum + parseCurrency(payment.amount), 0);

  return {
    month: new Date().getMonth() + 1,
    amount: formatCurrency(totalAmount),
    remaining: "이번 달 받은 혜택 0원",
  };
}

function toMainPaymentHistory(payment: PaymentHistoryItem): PaymentHistory {
  return {
    id: payment.id,
    merchantName: payment.title,
    cardName: getPaymentMethodLabel(payment.method),
    cardNumber: "",
    amount: payment.amount,
    paidAt: payment.date,
  };
}

function getPaymentMethodLabel(method: PaymentHistoryItem["method"]) {
  if (method === "remote") return "원격결제";
  if (method === "dutchpay") return "더치페이";
  return "일반결제";
}

function parseCurrency(value: string) {
  const numberValue = Number(value.replace(/[^\d.-]/g, ""));

  return Number.isFinite(numberValue) ? numberValue : 0;
}

function formatCurrency(value: number) {
  return `${Math.trunc(value).toLocaleString("ko-KR")}원`;
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
