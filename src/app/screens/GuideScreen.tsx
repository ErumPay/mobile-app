/******************************************************************************
 * File: GuideScreen.tsx
 * Description: 개발/퍼블리싱 확인용 IA 및 공통 컴포넌트 가이드 화면
 * Worker: [FE] 조보름
 * Created: 2026-05-29
 * Note: 운영 사용자 플로우가 아닌 내부 확인용 화면입니다.
 ******************************************************************************/

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import type { RootStackParamList } from "../../../App";
import { Accordion } from "../../shared/components/Accordion";
import {
  BottomSheet,
  DraggableBottomSheet,
} from "../../shared/components/BottomSheet";
import { Button } from "../../shared/components/Button";
import { Card } from "../../shared/components/Card";
import { Checkbox } from "../../shared/components/Checkbox";
import { EmptyState } from "../../shared/components/EmptyState";
import { ErrorPage } from "../../shared/components/ErrorPage";
import { FloatingButton } from "../../shared/components/FloatingButton";
import { Header } from "../../shared/components/Header";
import { ListItem } from "../../shared/components/ListItem";
import { Loading } from "../../shared/components/Loading";
import { RejectConfirmModal } from "../../shared/components/Modal";
import { NoticeBox } from "../../shared/components/NoticeBox";
import { PageWrap } from "../../shared/components/PageWrap";
import { Radio } from "../../shared/components/Radio";
import { SkeletonCard } from "../../shared/components/Skeleton";
import { Tab } from "../../shared/components/Tab";
import { Toast } from "../../shared/components/Toast";
import { Toggle } from "../../shared/components/Toggle";
import { colors } from "../../shared/styles";

import { Input } from "../../shared/components/Input";
import { Modal } from "../../shared/components/Modal";

type GuideStatus = "done" | "progress" | "planned";

type GuidePage = {
  depth1: string;
  depth2: string;
  pageName: string;
  routeName: string;
  route?: keyof RootStackParamList;
  status: GuideStatus;
  note?: string;
};

type ComponentGuideItem = {
  name: string;
  path: string;
  status: GuideStatus;
  preview?: ComponentPreview;
  note?: string;
};

type ComponentPreview =
  | "errorPage"
  | "rejectConfirmModal"
  | "bottomSheet"
  | "draggableBottomSheet"
  | "toast"
  | "loading"
  | "skeleton"
  | "header"
  | "button"
  | "floatingButton"
  | "tab"
  | "toggle"
  | "checkbox"
  | "radio"
  | "accordion"
  | "card"
  | "listItem"
  | "emptyState"
  | "noticeBox"
  | "pageWrap"
  | "input"
  | "modal";

const guidePages: GuidePage[] = [
  {
    depth1: "app",
    depth2: "main",
    pageName: "메인",
    routeName: "Main",
    route: "Main",
    status: "done",
    note: "담당자 : 이준혁",
  },
  {
    depth1: "card",
    depth2: "register",
    pageName: "카드 등록",
    routeName: "CardRegister",
    route: "CardRegister",
    status: "done",
    note: "담당자 : 나혜빈",
  },
  {
    depth1: "qr",
    depth2: "scan",
    pageName: "QR 스캔",
    routeName: "QrScan",
    route: "QrScan",
    status: "done",
    note: "담당자 : 조보름",
  },
  {
    depth1: "payment",
    depth2: "method-select",
    pageName: "카드결제 결제수단 선택",
    routeName: "PaymentMethodSelect",
    route: "PaymentMethodSelect",
    status: "done",
    note: "담당자 : 조보름",
  },
  {
    depth1: "payment",
    depth2: "card-select",
    pageName: "카드결제 카드 선택",
    routeName: "PaymentCardSelect",
    route: "PaymentCardSelect",
    status: "done",
    note: "담당자 : 조보름",
  },
  {
    depth1: "payment",
    depth2: "pin-input",
    pageName: "카드결제 간편비밀번호 입력",
    routeName: "PaymentPin",
    route: "PaymentPin",
    status: "done",
    note: "담당자 : 조보름",
  },
  {
    depth1: "payment",
    depth2: "pin-register",
    pageName: "카드결제 간편비밀번호 등록",
    routeName: "PaymentPin",
    route: "PaymentPin",
    status: "done",
    note: "담당자 : 조보름",
  },
  {
    depth1: "payment",
    depth2: "pin-confirm",
    pageName: "카드결제 간편비밀번호 확인",
    routeName: "PaymentPin",
    route: "PaymentPin",
    status: "done",
    note: "담당자 : 조보름",
  },
  {
    depth1: 'payment',
    depth2: 'result-normal-success',
    pageName: '일반결제 결제 완료',
    routeName: 'PaymentResult',
    route: 'PaymentResult',
    status: 'done',
    note: '담당자 : 조보름',
  },
  {
    depth1: 'payment',
    depth2: 'result-normal-failure',
    pageName: '일반결제 결제 실패',
    routeName: 'PaymentResult',
    route: 'PaymentResult',
    status: 'done',
    note: '담당자 : 조보름',
  },
  {
    depth1: 'payment',
    depth2: 'result-dutch-preauth-success',
    pageName: '더치페이 가결제 완료',
    routeName: 'PaymentResult',
    route: 'PaymentResult',
    status: 'done',
    note: '담당자 : 조보름',
  },
  {
    depth1: 'payment',
    depth2: 'result-dutch-preauth-failure',
    pageName: '더치페이 가결제 실패',
    routeName: 'PaymentResult',
    route: 'PaymentResult',
    status: 'done',
    note: '담당자 : 조보름',
  },
  {
    depth1: 'payment',
    depth2: 'result-dutch-final-success',
    pageName: '더치페이 최종결제 완료',
    routeName: 'PaymentResult',
    route: 'PaymentResult',
    status: 'done',
    note: '담당자 : 조보름',
  },
  {
    depth1: 'payment',
    depth2: 'cancel-request',
    pageName: '결제 취소 요청',
    routeName: 'PaymentCancel',
    route: 'PaymentCancel',
    status: 'planned',
    note: '담당자 : 조보름',
  },
  {
    depth1: 'payment',
    depth2: 'cancel-complete',
    pageName: '결제 취소 완료',
    routeName: 'PaymentCancel',
    route: 'PaymentCancel',
    status: 'planned',
    note: '담당자 : 조보름',
  },
];

const componentGuideItems: ComponentGuideItem[] = [
  {
    name: "ErrorPage",
    path: "src/shared/components/ErrorPage",
    status: "done",
    preview: "errorPage",
    note: "404/500",
  },
  {
    name: "BottomSheet",
    path: "src/shared/components/BottomSheet",
    status: "done",
    preview: "bottomSheet",
  },
  {
    name: "RejectConfirmModal",
    path: "src/shared/components/Modal",
    status: "done",
    preview: "rejectConfirmModal",
    note: "결제 거절 확인",
  },
  {
    name: "DraggableBottomSheet",
    path: "src/shared/components/BottomSheet",
    status: "done",
    preview: "draggableBottomSheet",
    note: "드래그 높이 변경",
  },
  {
    name: "Toast",
    path: "src/shared/components/Toast",
    status: "done",
    preview: "toast",
  },
  {
    name: "Loading",
    path: "src/shared/components/Loading",
    status: "done",
    preview: "loading",
  },
  {
    name: "Skeleton",
    path: "src/shared/components/Skeleton",
    status: "done",
    preview: "skeleton",
  },
  {
    name: "Header",
    path: "src/shared/components/Header",
    status: "done",
    preview: "header",
    note: "뒤로가기형/닫기형",
  },
  {
    name: "Button",
    path: "src/shared/components/Button",
    status: "done",
    preview: "button",
  },
  {
    name: "FloatingButton",
    path: "src/shared/components/FloatingButton",
    status: "done",
    preview: "floatingButton",
  },
  {
    name: "Tab",
    path: "src/shared/components/Tab",
    status: "done",
    preview: "tab",
  },
  {
    name: "Toggle",
    path: "src/shared/components/Toggle",
    status: "done",
    preview: "toggle",
  },
  {
    name: "Checkbox",
    path: "src/shared/components/Checkbox",
    status: "done",
    preview: "checkbox",
  },
  {
    name: "Radio",
    path: "src/shared/components/Radio",
    status: "done",
    preview: "radio",
  },
  {
    name: "Accordion",
    path: "src/shared/components/Accordion",
    status: "done",
    preview: "accordion",
  },
  {
    name: "Card",
    path: "src/shared/components/Card",
    status: "done",
    preview: "card",
  },
  {
    name: "ListItem",
    path: "src/shared/components/ListItem",
    status: "done",
    preview: "listItem",
  },
  {
    name: "EmptyState",
    path: "src/shared/components/EmptyState",
    status: "done",
    preview: "emptyState",
  },
  {
    name: "NoticeBox",
    path: "src/shared/components/NoticeBox",
    status: "done",
    preview: "noticeBox",
  },
  {
    name: "PageWrap",
    path: "src/shared/components/PageWrap",
    status: "done",
    preview: "pageWrap",
    note: "모바일/태블릿 공통 wrap",
  },
  {
    name: "Input",
    path: "src/shared/components/Input",
    status: "done",
    preview: "input",
  },
  {
    name: "Modal",
    path: "src/shared/components/Modal",
    status: "done",
    preview: "modal",
  },
];

const statusLabel: Record<GuideStatus, string> = {
  done: "완료",
  progress: "진행중",
  planned: "예정",
};

const statusClassName: Record<GuideStatus, string> = {
  done: "bg-state-success",
  progress: "bg-erum-main",
  planned: "bg-neutral-black2",
};

const colorGroups = [
  {
    title: "Main",
    items: [
      { name: "Main", value: colors.erum.main, className: "bg-erum-main" },
      {
        name: "Secondary",
        value: colors.erum.secondary,
        className: "bg-erum-secondary",
      },
      {
        name: "Primary",
        value: colors.erum.primary,
        className: "bg-erum-primary",
      },
    ],
  },
  {
    title: "State",
    items: [
      { name: "Gold", value: colors.state.gold, className: "bg-state-gold" },
      {
        name: "Silver",
        value: colors.state.silver,
        className: "bg-state-silver",
      },
      { name: "Error", value: colors.state.error, className: "bg-state-error" },
      {
        name: "Success",
        value: colors.state.success,
        className: "bg-state-success",
      },
      {
        name: "Orange",
        value: colors.state.orange,
        className: "bg-state-orange",
      },
      { name: "Sky", value: colors.state.sky, className: "bg-state-sky" },
    ],
  },
  {
    title: "Neutral",
    items: [
      {
        name: "Black 1",
        value: colors.neutral.black1,
        className: "bg-neutral-black1",
      },
      {
        name: "Black 2",
        value: colors.neutral.black2,
        className: "bg-neutral-black2",
      },
      {
        name: "Grey 1",
        value: colors.neutral.grey1,
        className: "bg-neutral-grey1",
      },
      {
        name: "Grey 2",
        value: colors.neutral.grey2,
        className: "bg-neutral-grey2",
      },
      {
        name: "White",
        value: colors.neutral.white,
        className: "bg-neutral-white",
      },
    ],
  },
];

const typographyItems = [
  { name: "Heading 1", className: "text-heading-1" },
  { name: "Heading 2", className: "text-heading-2" },
  { name: "Heading 3", className: "text-heading-3" },
  { name: "Large Bold", className: "text-large-bold" },
  { name: "Large Regular", className: "text-large-regular" },
  { name: "Normal Bold", className: "text-normal-bold" },
  { name: "Normal Regular", className: "text-normal-regular" },
  { name: "Small Bold", className: "text-small-bold" },
  { name: "Small Regular", className: "text-small-regular" },
];

type Props = NativeStackScreenProps<RootStackParamList, "Guide">;

export default function GuideScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const horizontalPadding = 20;
  const contentWidth = Math.max(
    0,
    Math.min(width - horizontalPadding * 2, 720),
  );
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [isDraggableBottomSheetVisible, setIsDraggableBottomSheetVisible] =
    useState(false);
  const [isRejectConfirmPreviewVisible, setIsRejectConfirmPreviewVisible] =
    useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isErrorPreviewVisible, setIsErrorPreviewVisible] = useState(false);
  const [selectedComponentPreview, setSelectedComponentPreview] =
    useState<ComponentPreview>("skeleton");
  const [selectedTab, setSelectedTab] = useState("first");
  const [isToggleOn, setIsToggleOn] = useState(false);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(true);
  const [selectedRadio, setSelectedRadio] = useState("card");
  const [isAccordionExpanded, setIsAccordionExpanded] = useState(true);
  const [selectedFloatingItem, setSelectedFloatingItem] = useState("payment");
  const [isCardSelected, setIsCardSelected] = useState(true);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [guideInputText, setGuideInputText] = useState("");
  const [guideInputNumber, setGuideInputNumber] = useState("");
  const [isOneButtonModalVisible, setIsOneButtonModalVisible] = useState(false);
  const [isTwoButtonModalVisible, setIsTwoButtonModalVisible] = useState(false);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const handlePressComponentPreview = (
    preview: ComponentGuideItem["preview"],
  ) => {
    if (preview === "rejectConfirmModal") {
      setIsRejectConfirmPreviewVisible(true);
      return;
    }

    if (preview === "bottomSheet") {
      setIsBottomSheetVisible(true);
      return;
    }

    if (preview === "draggableBottomSheet") {
      setIsDraggableBottomSheetVisible(true);
      return;
    }

    if (preview === "toast") {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }

      setIsToastVisible(true);
      toastTimerRef.current = setTimeout(() => {
        setIsToastVisible(false);
        toastTimerRef.current = null;
      }, 1800);
      return;
    }

    if (preview === "errorPage") {
      setIsErrorPreviewVisible(true);
      return;
    }

    if (preview) {
      setSelectedComponentPreview(preview);
    }
  };

  return (
    <PageWrap
      scroll={false}
      padded={false}
      header={
        <Header
          title="IA 가이드"
          type="back"
          onPressLeft={() => navigation.navigate("Main")}
        />
      }
    >
      {isErrorPreviewVisible ? (
        <ErrorPage
          variant="notFound"
          actionLabel="가이드로 돌아가기"
          onPressAction={() => setIsErrorPreviewVisible(false)}
        />
      ) : (
        <ScrollView className="flex-1 bg-neutral-grey2">
          <View className="w-full items-center px-5 py-6">
            <View style={{ width: contentWidth }} className="gap-5">
              <GuideSection title="CI">
                <View className="rounded-xl border border-neutral-grey1 bg-neutral-white p-4">
                  <Image
                    resizeMode="contain"
                    source={require("../../assets/images/erumpay-ci.png")}
                    style={{ width: "100%", height: 120 }}
                  />
                </View>
              </GuideSection>

              <GuideSection title="Grid">
                <View className="gap-3 rounded-xl border border-neutral-grey1 bg-neutral-white p-4">
                  <Image
                    resizeMode="contain"
                    source={require("../../assets/images/erumpay-grid.png")}
                    style={{ width: "100%", height: 190 }}
                  />
                  <GuideGridRow
                    label="Mobile"
                    value="360 ~ 767 / 6 columns / gap 12"
                  />
                  <GuideGridRow
                    label="Tablet"
                    value="768 ~ 1200 / 6 columns / gap 12"
                  />
                </View>
              </GuideSection>

              <GuideSection title="IA">
                <View className="gap-2">
                  {guidePages.map((page) => (
                    <GuideListRow
                      key={`${page.depth1}-${page.depth2}-${page.routeName}`}
                      status={page.status}
                      title={`${page.depth1} / ${page.depth2}`}
                      description={`${page.pageName} · ${page.routeName}`}
                      note={page.note}
                      onPress={
                        page.route
                          ? () => {
                              if (page.route === "Main") {
                                navigation.navigate("Main");
                                return;
                              }

                              if (page.route === "CardRegister") {
                                navigation.navigate("CardRegister");
                                return;
                              }

                              if (page.route === "QrScan") {
                                navigation.navigate("QrScan");
                                return;
                              }

                              if (page.route === "PaymentMethodSelect") {
                                navigation.navigate("PaymentMethodSelect");
                                return;
                              }

                              if (page.route === "PaymentCardSelect") {
                                navigation.navigate("PaymentCardSelect");
                                return;
                              }

                              if (page.route === "PaymentPin") {
                                if (page.depth2 === "pin-register") {
                                  navigation.navigate("PaymentPin", {
                                    mode: "REGISTER",
                                  });
                                  return;
                                }

                                if (page.depth2 === "pin-confirm") {
                                  navigation.navigate("PaymentPin", {
                                    mode: "CONFIRM",
                                  });
                                  return;
                                }

                                navigation.navigate("PaymentPin", {
                                  mode: "PAYMENT_INPUT",
                                  paymentId: 1,
                                  cardId: 1,
                                  amount: 45000,
                                  flow: "NORMAL",
                                });
                                return;
                              }

                              if (page.route === 'PaymentResult') {
                                if (page.depth2 === 'result-normal-failure') {
                                  navigation.navigate('PaymentResult', {
                                    status: 'FAILURE',
                                    flow: 'NORMAL',
                                  });
                                  return;
                                }

                                if (page.depth2 === 'result-dutch-preauth-success') {
                                  navigation.navigate('PaymentResult', {
                                    status: 'SUCCESS',
                                    flow: 'DUTCH_PAY_PRE_AUTH',
                                  });
                                  return;
                                }

                                if (page.depth2 === 'result-dutch-preauth-failure') {
                                  navigation.navigate('PaymentResult', {
                                    status: 'FAILURE',
                                    flow: 'DUTCH_PAY_PRE_AUTH',
                                  });
                                  return;
                                }

                                if (page.depth2 === 'result-dutch-final-success') {
                                  navigation.navigate('PaymentResult', {
                                    status: 'SUCCESS',
                                    flow: 'DUTCH_PAY_FINAL',
                                  });
                                  return;
                                }

                                navigation.navigate('PaymentResult', {
                                  status: 'SUCCESS',
                                  flow: 'NORMAL',
                                });
                                return;
                              }

                              if (page.route === 'PaymentCancel') {
                                if (page.depth2 === 'cancel-complete') {
                                  navigation.navigate('PaymentCancel', {
                                    mode: 'COMPLETE',
                                  });
                                  return;
                                }

                                navigation.navigate('PaymentCancel', {
                                  mode: 'REQUEST',
                                });
                                return;
                              }
                            }
                          : undefined
                      }
                    />
                  ))}
                </View>
              </GuideSection>

              <GuideSection title="Colors">
                <View className="gap-4 rounded-xl border border-neutral-grey1 bg-neutral-white p-4">
                  {colorGroups.map((group) => (
                    <View key={group.title}>
                      <Text className="mb-2 font-pretendard text-heading-3 text-neutral-black1">
                        {group.title}
                      </Text>
                      <View className="flex-row flex-wrap gap-3">
                        {group.items.map((item) => (
                          <View
                            key={`${group.title}-${item.name}`}
                            className="w-[92px]"
                          >
                            <View
                              className={`mb-2 h-12 rounded-lg border border-neutral-grey1 ${item.className}`}
                            />
                            <Text className="font-pretendard text-normal-bold text-neutral-black1">
                              {item.name}
                            </Text>
                            <Text className="font-pretendard text-normal-regular text-neutral-black2">
                              {item.value}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              </GuideSection>

              <GuideSection title="Typography">
                <View className="gap-3 rounded-xl border border-neutral-grey1 bg-neutral-white p-4">
                  {typographyItems.map((item) => (
                    <View
                      key={item.name}
                      className="flex-row items-center justify-between gap-4"
                    >
                      <Text
                        className={`min-w-0 flex-1 font-pretendard text-neutral-black1 ${item.className}`}
                      >
                        {item.name}
                      </Text>
                    </View>
                  ))}
                </View>
              </GuideSection>

              <GuideSection title="Components">
                <View className="gap-2">
                  {componentGuideItems.map((item) => (
                    <GuideListRow
                      key={item.name}
                      status={item.status}
                      title={item.name}
                      description={item.path}
                      note={item.note}
                      onPress={
                        item.status === "done" && item.preview
                          ? () => handlePressComponentPreview(item.preview)
                          : undefined
                      }
                    />
                  ))}
                </View>
              </GuideSection>

              <GuideSection title="Preview">
                <View className="min-h-[180px] overflow-hidden rounded-xl border border-neutral-grey1 bg-neutral-white p-4">
                  <ComponentPreviewArea
                    preview={selectedComponentPreview}
                    selectedTab={selectedTab}
                    isToggleOn={isToggleOn}
                    isCheckboxChecked={isCheckboxChecked}
                    selectedRadio={selectedRadio}
                    isAccordionExpanded={isAccordionExpanded}
                    selectedFloatingItem={selectedFloatingItem}
                    isCardSelected={isCardSelected}
                    guideInputText={guideInputText}
                    guideInputNumber={guideInputNumber}
                    onChangeGuideInputText={setGuideInputText}
                    onChangeGuideInputNumber={setGuideInputNumber}
                    onPressButton={() => handlePressComponentPreview("toast")}
                    onPressOneButtonModal={() =>
                      setIsOneButtonModalVisible(true)
                    }
                    onPressTwoButtonModal={() =>
                      setIsTwoButtonModalVisible(true)
                    }
                    onChangeTab={setSelectedTab}
                    onChangeToggle={setIsToggleOn}
                    onChangeCheckbox={setIsCheckboxChecked}
                    onChangeRadio={setSelectedRadio}
                    onChangeFloatingItem={setSelectedFloatingItem}
                    onChangeCardSelected={setIsCardSelected}
                    onToggleAccordion={() =>
                      setIsAccordionExpanded((currentValue) => !currentValue)
                    }
                  />
                </View>
              </GuideSection>
            </View>
          </View>
        </ScrollView>
      )}

      <BottomSheet
        title="BottomSheet Preview"
        visible={isBottomSheetVisible}
        onClose={() => setIsBottomSheetVisible(false)}
      >
        <View className="gap-3">
          <Text className="font-pretendard text-large-bold text-neutral-black1">
            바텀시트 샘플입니다.
          </Text>
          <Text className="font-pretendard text-large-regular text-neutral-black2">
            닫기 버튼이나 배경 영역을 눌러 닫을 수 있어요.
          </Text>
        </View>
      </BottomSheet>

      <DraggableBottomSheet
        title="Draggable BottomSheet Preview"
        visible={isDraggableBottomSheetVisible}
        onClose={() => setIsDraggableBottomSheetVisible(false)}
      >
        <View className="gap-3">
          <Text className="font-pretendard text-large-bold text-neutral-black1">
            핸들을 탭하거나 위아래로 드래그해보세요.
          </Text>
          <Text className="font-pretendard text-large-regular text-neutral-black2">
            기본 높이와 확장 높이 사이에서 바텀시트 높이가 변경됩니다.
          </Text>
          <NoticeBox
            description="정교한 제스처/스냅 포인트는 추후 gesture-handler 도입 시 고도화 가능합니다."
            tone="info"
          />
        </View>
      </DraggableBottomSheet>

      <Modal
        visible={isOneButtonModalVisible}
        type="one"
        icon={<Text className="text-[52px]">✅</Text>}
        title="카드 삭제가 완료되었습니다."
        confirmLabel="확인"
        onConfirm={() => setIsOneButtonModalVisible(false)}
        onClose={() => setIsOneButtonModalVisible(false)}
      />

      <Modal
        visible={isTwoButtonModalVisible}
        type="two"
        icon={<Text className="text-[52px]">⭐</Text>}
        title="Nany My 카드를 대표카드로 지정 하시겠습니까?"
        description="결제 시 우선으로 사용됩니다"
        confirmLabel="대표카드 설정하기"
        cancelLabel="닫기"
        onConfirm={() => setIsTwoButtonModalVisible(false)}
        onCancel={() => setIsTwoButtonModalVisible(false)}
        onClose={() => setIsTwoButtonModalVisible(false)}
      />

      <RejectConfirmModal
        visible={isRejectConfirmPreviewVisible}
        onCancel={() => setIsRejectConfirmPreviewVisible(false)}
        onConfirm={() => setIsRejectConfirmPreviewVisible(false)}
      />

      <Toast
        visible={isToastVisible}
        message="토스트 샘플입니다."
        type="success"
      />
    </PageWrap>
  );
}

function GuideSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View>
      <Text className="mb-3 font-pretendard text-heading-2 text-neutral-black1">
        {title}
      </Text>
      {children}
    </View>
  );
}

function GuideGridRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between gap-4">
      <Text className="font-pretendard text-large-bold text-neutral-black1">
        {label}
      </Text>
      <Text className="min-w-0 flex-1 text-right font-pretendard text-large-regular text-neutral-black2">
        {value}
      </Text>
    </View>
  );
}

function GuideListRow({
  status,
  title,
  description,
  note,
  onPress,
}: {
  status: GuideStatus;
  title: string;
  description: string;
  note?: string;
  onPress?: () => void;
}) {
  const content = (
    <View className="flex-row items-start justify-between gap-3">
      <View className="min-w-0 flex-1">
        <Text className="font-pretendard text-large-bold text-neutral-black1">
          {title}
        </Text>
        <Text className="mt-1 font-pretendard text-normal-regular text-neutral-black2">
          {description}
        </Text>
        {note ? (
          <Text className="mt-2 font-pretendard text-normal-regular text-erum-secondary">
            {note}
          </Text>
        ) : null}
      </View>

      <View className={`rounded-full px-3 py-1 ${statusClassName[status]}`}>
        <Text className="font-pretendard text-normal-bold text-neutral-white">
          {statusLabel[status]}
        </Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        className="rounded-xl border border-neutral-grey1 bg-neutral-white p-4"
        onPress={onPress}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View className="rounded-xl border border-neutral-grey1 bg-neutral-white p-4">
      {content}
    </View>
  );
}

function ComponentPreviewArea({
  preview,
  selectedTab,
  isToggleOn,
  isCheckboxChecked,
  selectedRadio,
  isAccordionExpanded,
  selectedFloatingItem,
  isCardSelected,
  guideInputText,
  guideInputNumber,
  onPressOneButtonModal,
  onPressTwoButtonModal,
  onChangeGuideInputText,
  onChangeGuideInputNumber,
  onPressButton,
  onChangeTab,
  onChangeToggle,
  onChangeCheckbox,
  onChangeRadio,
  onChangeFloatingItem,
  onChangeCardSelected,
  onToggleAccordion,
}: {
  preview: ComponentPreview;
  selectedTab: string;
  isToggleOn: boolean;
  isCheckboxChecked: boolean;
  selectedRadio: string;
  isAccordionExpanded: boolean;
  selectedFloatingItem: string;
  isCardSelected: boolean;
  guideInputText: string;
  guideInputNumber: string;
  onPressOneButtonModal: () => void;
  onPressTwoButtonModal: () => void;
  onChangeGuideInputText: (value: string) => void;
  onChangeGuideInputNumber: (value: string) => void;
  onPressButton: () => void;
  onChangeTab: (value: string) => void;
  onChangeToggle: (value: boolean) => void;
  onChangeCheckbox: (value: boolean) => void;
  onChangeRadio: (value: string) => void;
  onChangeFloatingItem: (value: string) => void;
  onChangeCardSelected: (value: boolean) => void;
  onToggleAccordion: () => void;
}) {
  if (preview === "loading") {
    return <Loading message="결제 정보를 불러오는 중입니다." />;
  }

  if (preview === "skeleton") {
    return <SkeletonCard />;
  }

  if (preview === "header") {
    return (
      <View className="gap-3">
        <Header title="뒤로가기 헤더" type="back" onPressLeft={() => {}} />
        <Header title="닫기 헤더" type="close" onPressRight={() => {}} />
      </View>
    );
  }

  if (preview === "button") {
    return (
      <View className="gap-3">
        <Button label="Primary Button" onPress={onPressButton} />
        <Button
          label="Secondary Button"
          variant="secondary"
          onPress={onPressButton}
        />
        <Button label="Disabled Button" disabled onPress={onPressButton} />
        <Button label="Readonly Button" readOnly />
      </View>
    );
  }

  if (preview === "floatingButton") {
    return (
      <View className="min-h-[180px] overflow-hidden rounded-xl bg-neutral-grey2">
        <Text className="font-pretendard text-large-regular text-neutral-black2">
          앱 하단 플로팅 내비게이션 미리보기
        </Text>

        <FloatingButton
          value={selectedFloatingItem}
          onChange={onChangeFloatingItem}
        />
      </View>
    );
  }

  if (preview === "tab") {
    return (
      <Tab
        items={[
          { label: "첫번째", value: "first" },
          { label: "두번째", value: "second" },
          { label: "세번째", value: "third" },
        ]}
        value={selectedTab}
        onChange={onChangeTab}
      />
    );
  }

  if (preview === "toggle") {
    return (
      <Toggle label="알림 받기" value={isToggleOn} onChange={onChangeToggle} />
    );
  }

  if (preview === "checkbox") {
    return (
      <Checkbox
        checked={isCheckboxChecked}
        label="약관에 동의합니다"
        onChange={onChangeCheckbox}
      />
    );
  }

  if (preview === "radio") {
    return (
      <Radio
        items={[
          { label: "카드 결제", value: "card" },
          { label: "계좌 결제", value: "account" },
          { label: "포인트 결제", value: "point" },
        ]}
        value={selectedRadio}
        onChange={onChangeRadio}
      />
    );
  }
  if (preview === "input") {
    return (
      <View className="gap-4">
        <Input
          label="문자"
          type="text"
          placeholder="문자를 입력해주세요."
          value={guideInputText}
          onChangeText={onChangeGuideInputText}
        />

        <Input
          label="숫자"
          type="number"
          placeholder="숫자를 입력해주세요."
          value={guideInputNumber}
          maxLength={16}
          onChangeText={onChangeGuideInputNumber}
        />

        <Input
          label="읽기전용"
          type="text"
          placeholder="수정할 수 없는 입력값입니다."
          value="읽기전용 상태"
          readOnly
        />
      </View>
    );
  }

  if (preview === "modal") {
    return (
      <View className="gap-3">
        <Button label="1버튼 모달 확인" onPress={onPressOneButtonModal} />
        <Button
          label="2버튼 모달 확인"
          variant="secondary"
          onPress={onPressTwoButtonModal}
        />
      </View>
    );
  }

  if (preview === "accordion") {
    return (
      <Accordion
        expanded={isAccordionExpanded}
        title="아코디언 타이틀"
        onToggle={onToggleAccordion}
      >
        <Text className="font-pretendard text-large-regular text-neutral-black2">
          접고 펼칠 수 있는 상세 내용 영역입니다.
        </Text>
      </Accordion>
    );
  }

  if (preview === "card") {
    return (
      <Card
        selected={isCardSelected}
        title="이룸페이 카드"
        description="선택 가능한 카드형 공통 UI입니다."
        onPress={() => onChangeCardSelected(!isCardSelected)}
      >
        <Text className="font-pretendard text-normal-regular text-erum-secondary">
          누르면 선택 상태가 변경됩니다.
        </Text>
      </Card>
    );
  }

  if (preview === "listItem") {
    return (
      <View className="gap-2 rounded-xl bg-neutral-grey2 p-3">
        <ListItem
          description="신한카드 Deep Dream"
          left={
            <View className="h-10 w-10 items-center justify-center rounded-full bg-erum-main">
              <Text className="font-pretendard text-normal-bold text-neutral-white">
                카드
              </Text>
            </View>
          }
          right={
            <View className="items-end">
              <Text className="font-pretendard text-large-bold text-erum-main">
                선택
              </Text>
              <Text className="mt-1 font-pretendard text-normal-regular text-neutral-black2">
                결제수단
              </Text>
            </View>
          }
          title="카드 결제"
          onPress={() => {}}
        />
        <ListItem
          description="2026.05.29 01:42"
          left={
            <View className="h-10 w-10 items-center justify-center rounded-full bg-neutral-white">
              <Text className="font-pretendard text-normal-bold text-erum-main">
                PAY
              </Text>
            </View>
          }
          right={
            <View className="flex-row items-center gap-3">
              <View className="items-end">
                <Text className="font-pretendard text-large-bold text-neutral-black1">
                  32,000원
                </Text>
                <Text className="mt-1 font-pretendard text-normal-regular text-state-success">
                  승인완료
                </Text>
              </View>
              <Text className="font-pretendard text-heading-3 text-neutral-black2">
                ›
              </Text>
            </View>
          }
          title="이룸카페"
          onPress={() => {}}
        />
      </View>
    );
  }

  if (preview === "emptyState") {
    return (
      <EmptyState
        actionLabel="새로고침"
        description="조건에 맞는 결제 내역이 없어요."
        title="조회 결과가 없습니다"
        onPressAction={() => {}}
      />
    );
  }

  if (preview === "noticeBox") {
    return (
      <View className="gap-3">
        <NoticeBox
          description="입력하신 정보는 안전하게 보호됩니다."
          tone="info"
        />
        <NoticeBox description="카드 등록이 완료되었습니다." tone="success" />
        <NoticeBox
          description="결제 전 금액을 다시 확인해주세요."
          tone="warning"
        />
      </View>
    );
  }

  if (preview === "pageWrap") {
    return (
      <View className="h-[220px] overflow-hidden rounded-lg border border-neutral-grey1">
        <PageWrap>
          <Text className="font-pretendard text-large-bold text-neutral-black1">
            PageWrap Preview
          </Text>
          <Text className="mt-2 font-pretendard text-large-regular text-neutral-black2">
            SafeArea, 배경, 기본 padding을 포함한 화면 래퍼입니다.
          </Text>
        </PageWrap>
      </View>
    );
  }

  return (
    <Text className="font-pretendard text-large-regular text-neutral-black2">
      목록에서 컴포넌트를 선택해주세요.
    </Text>
  );
}
