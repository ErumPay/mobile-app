import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
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
import Modal, { RejectConfirmModal } from "../../../shared/components/Modal";
import { PageWrap } from "../../../shared/components/PageWrap";
import { Skeleton } from "../../../shared/components/Skeleton";
import {
  getActiveDutchPaySessions,
  type DutchPaySessionDetailResponse,
} from "../../payment/api/dutchPayApi";
import {
  getActiveRemotePaymentRequests,
  rejectRemotePaymentRequest,
  subscribeRemotePaymentRequestStream,
} from "../../payment/api/remotePaymentApi";
import { fetchAuthFriends, type AuthFriendResponse } from "../../friend/api/friendApi";
import { getPaymentUserId } from "../../payment/api/paymentApiConfig";
import { getCancelledDutchPaySessionIdSet } from "../../payment/utils/cancelledDutchPaySessions";
import { getConfirmedDutchPayAmountSessionIdSet } from "../../payment/utils/confirmedDutchPayAmountSessions";
import { getRequestedDutchPaySessionIdSet } from "../../payment/utils/requestedDutchPaySessions";
import { useRemotePaymentProgressStore } from "../../payment/stores/useRemotePaymentProgressStore";
import { useDutchPayProgressUserStore } from "../../payment/stores/useDutchPayProgressUserStore";
import {
  toRemotePaymentProgress,
  toRemotePaymentProgressVariant,
} from "../../payment/utils/remotePaymentAdapter";
import {
  fetchPaymentHistories,
  fetchUserProfile,
  fetchUserProfileById,
} from "../../mypage/api/mypageApi";
import { fetchNotifications } from "../../notification/api/notificationApi";
import type {
  PaymentHistoryItem,
  UserProfile,
} from "../../mypage/types/mypage";
import type { RemotePaymentRequestResponse } from "../../payment/types/remotePayment.types";

type Props = NativeStackScreenProps<RootStackParamList, "Main">;

type ActiveDutchPayProgress = {
  role: "OWNER" | "PARTICIPANT";
  session: DutchPaySessionDetailResponse;
  variant: PaymentProgressVariant;
};

type ActiveRemotePaymentProgress = {
  role: "REQUESTER" | "RECIPIENT";
  request: RemotePaymentRequestResponse;
  participantName: string;
  variant: PaymentProgressVariant;
};

type MainPaymentProgressItem =
  | ({
      id: string;
      type: "DUTCH";
    } & ActiveDutchPayProgress)
  | ({
      id: string;
      type: "REMOTE";
    } & ActiveRemotePaymentProgress);

type QuickMenu = {
  label: string;
  icon: "friends" | "card" | "history";
  toneClassName: string;
  iconColor: string;
  onPress?: () => void;
};

const DUTCH_PAY_TIMEOUT_MS = 30 * 60 * 1000;

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
  const { width: screenWidth } = useWindowDimensions();
  const progressViewportWidth = Math.max(screenWidth - 40, 1);
  const progressScrollRef = useRef<ScrollView>(null);
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
  const [hasNotification, setHasNotification] = useState(false);
  const [isMonthlyPaymentLoading, setIsMonthlyPaymentLoading] = useState(true);
  const [isPaymentHistoryLoading, setIsPaymentHistoryLoading] = useState(true);
  const [isNotificationLoading, setIsNotificationLoading] = useState(false);
  const [isPaymentProgressLoading, setIsPaymentProgressLoading] =
    useState(true);
  const remoteProgress = useRemotePaymentProgressStore((state) => state.progress);
  const acceptRemoteRequest = useRemotePaymentProgressStore(
    (state) => state.acceptRequest,
  );
  const rejectRemoteRequest = useRemotePaymentProgressStore(
    (state) => state.rejectRequest,
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
  const [dutchProgressItems, setDutchProgressItems] = useState<
    ActiveDutchPayProgress[]
  >([]);
  const [remoteProgressItems, setRemoteProgressItems] = useState<
    ActiveRemotePaymentProgress[]
  >([]);
  const progressItems = useMemo<MainPaymentProgressItem[]>(
    () => [
      ...dutchProgressItems.map((item) => ({
        ...item,
        id: `dutch-${item.session.session_id}`,
        type: "DUTCH" as const,
      })),
      ...remoteProgressItems.map((item) => ({
        ...item,
        id: `remote-${item.request.remotePaymentRequestId}`,
        type: "REMOTE" as const,
      })),
    ],
    [dutchProgressItems, remoteProgressItems],
  );
  const hasMultipleProgressItems = progressItems.length > 1;
  const progressCardGap = hasMultipleProgressItems ? 12 : 0;
  const progressCardSidePeek = hasMultipleProgressItems ? 12 : 0;
  const progressCardWidth = Math.max(
    progressViewportWidth - progressCardSidePeek * 2,
    1,
  );
  const progressCardInterval = progressCardWidth + progressCardGap;
  const [currentProgressIndex, setCurrentProgressIndex] = useState(0);
  const currentProgressItem = progressItems[currentProgressIndex] ?? null;
  const hasVisiblePaymentProgress = progressItems.length > 0;
  const hasRemoteNotification =
    progressItems.some(
      (item) =>
        item.type === "REMOTE" &&
        item.role === "RECIPIENT" &&
        item.request.status === "REQUESTED",
    );
  const [isRejectConfirmVisible, setIsRejectConfirmVisible] = useState(false);
  const [isDutchTimeoutModalVisible, setIsDutchTimeoutModalVisible] =
    useState(false);
  const [rejectTargetRequestId, setRejectTargetRequestId] = useState<
    number | string | null
  >(null);
  const remoteFriendLookupRef = useRef(new Map<string, AuthFriendResponse>());
  const remoteUserProfileLookupRef = useRef(new Map<string, UserProfile>());
  const remoteProgressRef = useRef(remoteProgress);
  const hadActiveDutchSessionRef = useRef(false);
  const dutchTimeoutModalShownRef = useRef(false);

  useEffect(() => {
    remoteProgressRef.current = remoteProgress;
  }, [remoteProgress]);

  useEffect(() => {
    if (currentProgressIndex < progressItems.length) {
      return;
    }

    setCurrentProgressIndex(Math.max(progressItems.length - 1, 0));
  }, [currentProgressIndex, progressItems.length]);

  const handleProgressScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextIndex = Math.round(
        event.nativeEvent.contentOffset.x / progressCardInterval,
      );

      if (nextIndex >= 0 && nextIndex < progressItems.length) {
        setCurrentProgressIndex(nextIndex);
      }
    },
    [progressCardInterval, progressItems.length],
  );

  const goToProgressItem = useCallback(
    (index: number) => {
      const clampedIndex = Math.max(0, Math.min(index, progressItems.length - 1));

      progressScrollRef.current?.scrollTo({
        x: clampedIndex * progressCardInterval,
        animated: true,
      });
      setCurrentProgressIndex(clampedIndex);
    },
    [progressCardInterval, progressItems.length],
  );

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

      setIsNotificationLoading(true);
      fetchNotifications({ page: 0, size: 1, isRead: false })
        .then((response) => {
          if (isActive) {
            setHasNotification(response.totalCount > 0);
          }
        })
        .catch(() => {
          // Keep the previous badge state on transient notification API failures.
        })
        .finally(() => {
          if (isActive) {
            setIsNotificationLoading(false);
          }
        });

      return () => {
        isActive = false;
      };
    }, []),
  );

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
            setDutchProgressItems([]);
            setRemoteProgressItems([]);
            clearRemoteProgress();
            return;
          }

          const [
            dutchSessions,
            requests,
            cancelledDutchSessionIds,
            confirmedDutchAmountSessionIds,
            requestedDutchSessionIds,
            friends,
          ] =
            await Promise.allSettled([
            getActiveDutchPaySessions(currentUserId),
            getActiveRemotePaymentRequests(),
            getCancelledDutchPaySessionIdSet(),
            getConfirmedDutchPayAmountSessionIdSet(),
            getRequestedDutchPaySessionIdSet(),
            fetchAuthFriends(),
          ]);

          if (!isActive) {
            return;
          }

          if (dutchSessions.status === "fulfilled") {
            if (
              hadActiveDutchSessionRef.current &&
              dutchSessions.value.length === 0 &&
              !dutchTimeoutModalShownRef.current
            ) {
              dutchTimeoutModalShownRef.current = true;
              setIsDutchTimeoutModalVisible(true);
            }

            hadActiveDutchSessionRef.current = dutchSessions.value.length > 0;

            setDutchProgressItems(
              getActiveDutchPayProgressItems(
                dutchSessions.value,
                currentUserId,
                cancelledDutchSessionIds.status === "fulfilled"
                  ? cancelledDutchSessionIds.value
                  : new Set(),
                confirmedDutchAmountSessionIds.status === "fulfilled"
                  ? confirmedDutchAmountSessionIds.value
                  : new Set(),
                requestedDutchSessionIds.status === "fulfilled"
                  ? requestedDutchSessionIds.value
                  : new Set(),
              ),
            );
          } else {
            setDutchProgressItems([]);
          }

          if (requests.status !== "fulfilled") {
            setRemoteProgressItems([]);
            clearRemoteProgress();
            return;
          }

          const friendLookup =
            friends.status === "fulfilled"
              ? createRemoteFriendLookup(friends.value)
              : new Map<string, AuthFriendResponse>();
          if (friends.status === "fulfilled") {
            remoteFriendLookupRef.current = friendLookup;
          }

          const remoteUserProfileLookup = await createRemoteUserProfileLookup(
            requests.value,
          ).catch(() => new Map<string, UserProfile>());
          if (remoteUserProfileLookup.size > 0) {
            remoteUserProfileLookupRef.current = remoteUserProfileLookup;
          }

          const remoteRequests = requests.value.map((request) =>
            enrichRemotePaymentRequestWithFriends(
              request,
              currentUserId,
              friendLookup,
              remoteUserProfileLookup,
            ),
          );
          const incomingRequest = remoteRequests.find(
            (request) => Number(request.recipientUserId) === currentUserId,
          );
          const outgoingRequest = remoteRequests.find(
            (request) => Number(request.requesterUserId) === currentUserId,
          );
          const nextRemoteProgressItems = getActiveRemotePaymentProgressItems(
            remoteRequests,
            currentUserId,
          );

          setRemoteProgressItems(nextRemoteProgressItems);

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

  useEffect(() => {
    const currentUserId = paymentProgressUserId;
    const remoteRequestId = remoteProgress?.requestId;

    if (
      currentUserId == null ||
      !remoteRequestId ||
      isTerminalRemotePaymentStatus(remoteProgress.status)
    ) {
      return;
    }

    const applyRemoteRequest = (request: RemotePaymentRequestResponse) => {
      const nextRequest = enrichRemotePaymentRequestWithFriends(
        request,
        currentUserId,
        remoteFriendLookupRef.current,
        remoteUserProfileLookupRef.current,
      );

      if (isTerminalRemotePaymentStatus(nextRequest.status)) {
        clearRemoteProgress();
        return;
      }

      if (Number(nextRequest.recipientUserId) === currentUserId) {
        setRecipientProgress(nextRequest);
        return;
      }

      if (Number(nextRequest.requesterUserId) === currentUserId) {
        setRequesterProgress(nextRequest);
      }
    };

    return subscribeRemotePaymentRequestStream(remoteRequestId, {
      onConnected: (event) => applyRemoteRequest(event.request),
      onRequestUpdated: (event) => applyRemoteRequest(event.request),
      onError: (error) => {
        console.warn("[MainScreen] remote payment stream failed", error);
      },
    });
  }, [
    clearRemoteProgress,
    paymentProgressUserId,
    remoteProgress?.requestId,
    setRecipientProgress,
    setRequesterProgress,
  ]);

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
    if (
      !currentProgressItem ||
      currentProgressItem.type !== "REMOTE" ||
      currentProgressItem.role !== "RECIPIENT" ||
      currentProgressItem.request.status !== "REQUESTED"
    ) {
      return;
    }

    setRejectTargetRequestId(currentProgressItem.request.remotePaymentRequestId);
    setIsRejectConfirmVisible(true);
  };

  const confirmRejectPaymentProgress = async () => {
    try {
      if (rejectTargetRequestId) {
        await rejectRemotePaymentRequest(rejectTargetRequestId);
      }

      if (String(remoteProgress?.requestId) === String(rejectTargetRequestId)) {
        rejectRemoteRequest();
      }
      setRemoteProgressItems((prevItems) =>
        prevItems.filter(
          (item) =>
            String(item.request.remotePaymentRequestId) !==
            String(rejectTargetRequestId),
        ),
      );
      setRejectTargetRequestId(null);
      setIsRejectConfirmVisible(false);
    } catch {
      setRejectTargetRequestId(null);
      setIsRejectConfirmVisible(false);
    }
  };

  const handlePressPaymentProgressPrimary = () => {
    if (currentProgressItem?.type === "DUTCH") {
      if (currentProgressItem.variant === "DUTCHPAY_OWNER_GROUP_CREATE_READY") {
        navigation.push("PaymentParticipantSelect", {
          mode: "DUTCH_PAY",
          dutchSessionId: currentProgressItem.session.session_id,
          amount: currentProgressItem.session.total_amount,
          orderName: currentProgressItem.session.order_name,
          merchantId: currentProgressItem.session.merchant_id,
        });
        return;
      }

      navigation.navigate("DutchPayGroup", {
        role: currentProgressItem.role,
        scenario: getDutchPayRouteScenario(currentProgressItem.variant),
        sessionId: currentProgressItem.session.session_id,
        userId: paymentProgressUserId ?? undefined,
      });
      return;
    }

    if (
      currentProgressItem?.type === "REMOTE" &&
      currentProgressItem.role === "RECIPIENT"
    ) {
      const progress = toRemotePaymentProgress({
        response: currentProgressItem.request,
        role: "RECIPIENT",
      });

      setRecipientProgress(currentProgressItem.request);
      navigation.navigate("PaymentMethodSelect", {
        remoteRequestId: progress.requestId,
        summary: progress.summary,
      });
      return;
    }

    navigation.navigate("QrScan");
  };

  const handlePressPaymentProgressAccept = () => {
    if (
      !currentProgressItem ||
      currentProgressItem.type !== "REMOTE" ||
      currentProgressItem.role !== "RECIPIENT"
    ) {
      navigation.navigate("QrScan");
      return;
    }

    const progress = toRemotePaymentProgress({
      response: currentProgressItem.request,
      role: "RECIPIENT",
    });

    setRecipientProgress(currentProgressItem.request);
    acceptRemoteRequest();

    navigation.navigate("PaymentMethodSelect", {
      remoteRequestId: progress.requestId,
      summary: progress.summary,
    });
  };

  return (
    <View className="flex-1 items-center bg-neutral-grey2">
      <View className="w-full flex-1 overflow-hidden bg-neutral-white">
        <PageWrap
          padded={false}
          backgroundClassName="bg-neutral-white"
          header={
            <MainHeader
              hasNotification={hasNotification || hasRemoteNotification}
              isNotificationLoading={isNotificationLoading}
              onPressNotification={() => navigation.navigate("NotificationScreen")}
            />
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
                  <>
                    <ScrollView
                      ref={progressScrollRef}
                      horizontal
                      bounces={false}
                      decelerationRate="fast"
                      showsHorizontalScrollIndicator={false}
                      snapToInterval={progressCardInterval}
                      snapToAlignment="start"
                      contentContainerStyle={{
                        paddingHorizontal: progressCardSidePeek,
                      }}
                      onScroll={handleProgressScroll}
                      scrollEventThrottle={16}
                    >
                      {progressItems.map((item, itemIndex) => (
                        <View
                          key={item.id}
                          style={{
                            width: progressCardWidth,
                            marginRight:
                              itemIndex === progressItems.length - 1
                                ? 0
                                : progressCardGap,
                          }}
                        >
                          <PaymentProgressCard
                            participantName={
                              item.type === "REMOTE"
                                ? item.participantName
                                : undefined
                            }
                            variant={item.variant}
                            onPressAccept={handlePressPaymentProgressAccept}
                            onPressPrimary={handlePressPaymentProgressPrimary}
                            onPressReject={handleRejectPaymentProgress}
                          />
                        </View>
                      ))}
                    </ScrollView>

                    {progressItems.length > 1 ? (
                      <View className="mt-4 flex-row items-center justify-center gap-2">
                        {progressItems.map((item, dotIndex) => (
                          <Pressable
                            key={`${item.id}-dot`}
                            accessibilityRole="button"
                            accessibilityLabel={`${dotIndex + 1}번째 결제 진행 상태 보기`}
                            onPress={() => goToProgressItem(dotIndex)}
                          >
                            <View
                              className={`h-2 rounded-full ${
                                dotIndex === currentProgressIndex
                                  ? "w-5 bg-erum-main"
                                  : "w-2 bg-neutral-disabled"
                              }`}
                            />
                          </Pressable>
                        ))}
                      </View>
                    ) : null}
                  </>
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
      <Modal
        visible={isDutchTimeoutModalVisible}
        type="one"
        title="결제 요청 시간이 지났습니다."
        confirmLabel="확인"
        onConfirm={() => setIsDutchTimeoutModalVisible(false)}
        onClose={() => setIsDutchTimeoutModalVisible(false)}
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

function parseServerDateTime(value?: string | null) {
  if (!value) {
    return undefined;
  }

  const normalizedValue = /(?:Z|[+-]\d{2}:?\d{2})$/.test(value)
    ? value
    : `${value}Z`;
  const timestamp = Date.parse(normalizedValue);

  return Number.isFinite(timestamp) ? timestamp : undefined;
}

function isDutchPaySessionExpiredByTime(session: DutchPaySessionDetailResponse) {
  const expiresAt = parseServerDateTime(session.expires_at ?? session.expiresAt);

  if (expiresAt != null) {
    return Date.now() >= expiresAt;
  }

  const timeoutAt = parseServerDateTime(session.timeout_at ?? session.timeoutAt);

  if (timeoutAt != null) {
    return Date.now() >= timeoutAt;
  }

  const createdAt = parseServerDateTime(session.created_at ?? session.createdAt);

  if (createdAt == null) {
    return false;
  }

  return Date.now() - createdAt >= DUTCH_PAY_TIMEOUT_MS;
}

function getActiveDutchPayProgressItems(
  sessions: DutchPaySessionDetailResponse[],
  currentUserId: number,
  cancelledSessionIds: Set<number>,
  confirmedAmountSessionIds: Set<number>,
  requestedSessionIds: Set<number>,
): ActiveDutchPayProgress[] {
  const progressItems: ActiveDutchPayProgress[] = [];

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
      confirmedAmountSessionIds.has(session.session_id),
      requestedSessionIds.has(session.session_id),
    );

    if (variant) {
      progressItems.push({
        role,
        session,
        variant,
      });
    }
  }

  return progressItems;
}

function getActiveRemotePaymentProgressItems(
  requests: RemotePaymentRequestResponse[],
  currentUserId: number,
): ActiveRemotePaymentProgress[] {
  return requests
    .map((request): ActiveRemotePaymentProgress | null => {
      const isRecipient = Number(request.recipientUserId) === currentUserId;
      const isRequester = Number(request.requesterUserId) === currentUserId;

      if (!isRecipient && !isRequester) {
        return null;
      }

      if (isTerminalRemotePaymentStatus(request.status)) {
        return null;
      }

      const role = isRecipient ? "RECIPIENT" : "REQUESTER";
      const progress = toRemotePaymentProgress({ response: request, role });

      return {
        role,
        request,
        participantName: progress.participantName,
        variant: toRemotePaymentProgressVariant({
          role,
          status: request.status,
        }),
      };
    })
    .filter((item): item is ActiveRemotePaymentProgress => item != null);
}

function toDutchPayProgressVariant(
  session: DutchPaySessionDetailResponse,
  currentUserId: number,
  role: "OWNER" | "PARTICIPANT",
  isLocallyCancelled = false,
  isAmountConfirmed = false,
  isPaymentRequestSent = false,
): PaymentProgressVariant | null {
  if (
    isDutchPaySessionExpiredByTime(session) ||
    session.status === "COMPLETED" ||
    session.status === "FAILED" ||
    session.status === "TIMEOUT_HANDLED" ||
    session.status === "CANCELED" ||
    session.session_progress_step === "COMPLETED" ||
    session.session_progress_step === "FAILED" ||
    session.session_progress_step === "TIMEOUT_HANDLED" ||
    session.session_progress_step === "CANCELED"
  ) {
    return null;
  }

  if (
    session.session_progress_step === "GROUP_CREATED" ||
    session.session_progress_step === "PARTICIPANT_CONFIRM"
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
      case "AMOUNT_INPUT":
        return "DUTCHPAY_OWNER_AMOUNT_CONFIRM_READY";
      case "PAYMENT_REQUEST":
        return isPaymentRequestSent
          ? "DUTCHPAY_OWNER_WAITING_MEMBERS"
          : isAmountConfirmed
            ? "DUTCHPAY_OWNER_PAYMENT_REQUEST_READY"
            : "DUTCHPAY_OWNER_AMOUNT_CONFIRM_READY";
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

  if (isPaymentRequestSent) {
    return "DUTCHPAY_MEMBER_PAYMENT_READY";
  }

  if (
    session.session_progress_step === "PAYMENT_REQUEST" &&
    myParticipant.amount != null
  ) {
    return "DUTCHPAY_MEMBER_PAYMENT_READY";
  }

  if (
    isAmountConfirmed &&
    myParticipant.amount != null
  ) {
    return "DUTCHPAY_MEMBER_AMOUNT_REVIEW";
  }

  if (session.session_progress_step === "AMOUNT_INPUT" && myParticipant.amount == null) {
    return "DUTCHPAY_MEMBER_AMOUNT_INPUT_READY";
  }

  if (myParticipant.amount != null) {
    return "DUTCHPAY_MEMBER_AMOUNT_INPUT_READY";
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
    case "DUTCHPAY_MEMBER_AMOUNT_REVIEW":
      return "PARTICIPANT_AMOUNT_REVIEW" as const;
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

function createRemoteFriendLookup(friends: AuthFriendResponse[]) {
  return new Map(friends.map((friend) => [String(friend.userId), friend]));
}

async function createRemoteUserProfileLookup(
  requests: RemotePaymentRequestResponse[],
) {
  const userIds = Array.from(
    new Set(
      requests
        .flatMap((request) => [
          request.requesterUserId,
          request.recipientUserId,
        ])
        .map((userId) => toFiniteNumber(userId))
        .filter((userId): userId is number => userId != null),
    ),
  );
  const entries = await Promise.allSettled(
    userIds.map(async (userId) => {
      const profile = await fetchUserProfileById(userId);
      return [String(userId), profile] as const;
    }),
  );

  return new Map(
    entries
      .filter(
        (entry): entry is PromiseFulfilledResult<readonly [string, UserProfile]> =>
          entry.status === "fulfilled",
      )
      .map((entry) => entry.value),
  );
}

function enrichRemotePaymentRequestWithFriends(
  request: RemotePaymentRequestResponse,
  currentUserId: number,
  friendLookup: Map<string, AuthFriendResponse>,
  userProfileLookup: Map<string, UserProfile>,
): RemotePaymentRequestResponse {
  const requesterFriend =
    request.requesterUserId == null
      ? undefined
      : friendLookup.get(String(request.requesterUserId));
  const requesterProfile =
    request.requesterUserId == null
      ? undefined
      : userProfileLookup.get(String(request.requesterUserId));
  const recipientFriend = friendLookup.get(String(request.recipientUserId));
  const recipientProfile = userProfileLookup.get(String(request.recipientUserId));
  const isRequesterMe = Number(request.requesterUserId) === currentUserId;
  const isRecipientMe = Number(request.recipientUserId) === currentUserId;
  const requesterPhoneSuffix =
    requesterFriend?.phoneLastFour ?? getUserProfilePhoneSuffix(requesterProfile);
  const recipientPhoneSuffix =
    recipientFriend?.phoneLastFour ??
    getUserProfilePhoneSuffix(recipientProfile) ??
    request.recipientPhoneSuffix;

  return {
    ...request,
    requesterName: isRequesterMe
      ? "나"
      : formatRemoteUserLabel(
          requesterFriend?.name ?? requesterProfile?.name ?? request.requesterName,
          requesterPhoneSuffix,
        ),
    recipientName: isRecipientMe
      ? "나"
      : recipientFriend?.name || recipientProfile?.name || request.recipientName,
    recipientPhoneSuffix: isRecipientMe
      ? request.recipientPhoneSuffix
      : recipientPhoneSuffix,
  };
}

function getUserProfilePhoneSuffix(profile?: UserProfile) {
  return profile?.phone?.replace(/\D/g, "").slice(-4) || undefined;
}

function formatRemoteUserLabel(name: string, phoneSuffix?: string) {
  if (!phoneSuffix || /\(\d{4}\)$/.test(name)) {
    return name;
  }

  return `${name}(${phoneSuffix})`;
}

function isTerminalRemotePaymentStatus(
  status: RemotePaymentRequestResponse["status"],
) {
  return status === "REJECTED" || status === "COMPLETED";
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
