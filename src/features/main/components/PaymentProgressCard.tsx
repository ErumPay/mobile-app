import { Pressable, Text, View } from "react-native";

import { Skeleton } from "../../../shared/components/Skeleton";

type DutchpayProgressVariant =
  | "DUTCHPAY_OWNER_GROUP_CREATE_READY"
  | "DUTCHPAY_OWNER_MEMBER_CONFIRM_READY"
  | "DUTCHPAY_OWNER_AMOUNT_CONFIRM_READY"
  | "DUTCHPAY_OWNER_PAYMENT_REQUEST_READY"
  | "DUTCHPAY_OWNER_WAITING_MEMBERS"
  | "DUTCHPAY_OWNER_FINAL_PAYMENT_READY"
  | "DUTCHPAY_OWNER_COMPLETED"
  | "DUTCHPAY_MEMBER_REQUEST_RECEIVED"
  | "DUTCHPAY_MEMBER_AMOUNT_INPUT_READY"
  | "DUTCHPAY_MEMBER_PAYMENT_READY"
  | "DUTCHPAY_MEMBER_WAITING_OTHERS"
  | "DUTCHPAY_MEMBER_COMPLETED";

type RemoteOutgoingProgressVariant =
  | "REMOTE_OUTGOING_REQUEST_SENT"
  | "REMOTE_OUTGOING_REQUEST_ACCEPTED"
  | "REMOTE_OUTGOING_PAYMENT_COMPLETED"
  | "REMOTE_OUTGOING_REQUEST_REJECTED";

type RemoteIncomingProgressVariant =
  | "REMOTE_INCOMING_REQUEST_RECEIVED"
  | "REMOTE_INCOMING_REQUEST_ACCEPTED"
  | "REMOTE_INCOMING_PAYMENT_COMPLETED"
  | "REMOTE_INCOMING_REQUEST_REJECTED";

export type PaymentProgressVariant =
  | DutchpayProgressVariant
  | RemoteOutgoingProgressVariant
  | RemoteIncomingProgressVariant;

type ProgressStepState = "pending" | "done" | "failed";

type ProgressStepItem = {
  label: string;
  value: string;
  state: ProgressStepState;
};

type PaymentProgressCardProps = {
  participantName?: string;
  variant?: PaymentProgressVariant;
  onPressAccept?: () => void;
  onPressPrimary?: () => void;
  onPressReject?: () => void;
};

type PaymentProgressConfig = {
  actionLabel?: string;
  description?: string;
  steps: ProgressStepItem[];
  title: string;
  tone: "default" | "danger";
  type: "primary" | "dual" | "none";
};

const dutchpayOwnerLabels = [
  "그룹 생성",
  "인원 확정",
  "결제 진행",
  "결제 완료",
];
const dutchpayMemberLabels = [
  "그룹 참여",
  "금액 입력",
  "결제 진행",
  "결제 완료",
];
const remoteOutgoingLabels = ["요청", "결제 요청", "결제 완료"];
const remoteIncomingLabels = ["요청", "결제 진행", "결제 완료"];
const remoteRejectedLabels = ["요청", "결제 거절", "결제 완료"];

export function PaymentProgressCard({
  participantName,
  variant = "DUTCHPAY_OWNER_GROUP_CREATE_READY",
  onPressAccept,
  onPressPrimary,
  onPressReject,
}: PaymentProgressCardProps) {
  const config = getPaymentProgressConfig({ participantName, variant });
  const isDanger = config.tone === "danger";

  return (
    <View
      className={`rounded-xl border p-4 ${
        isDanger
          ? "border-[#FFC7C7] bg-[#FFE3E3]"
          : "border-[#FFE1B7] bg-[#FFF3DF]"
      }`}
    >
      <View className="flex-row items-start gap-2">
        <View
          className={`h-7 w-7 items-center justify-center rounded-full ${
            isDanger ? "bg-state-error" : "bg-[#FF934D]"
          }`}
        >
          <Text className="font-pretendard text-normal-bold text-neutral-white">
            !
          </Text>
        </View>
        <View className="min-w-0 flex-1">
          <Text className="font-pretendard text-large-bold text-neutral-black1">
            {config.title}
          </Text>
          {config.description ? (
            <Text className="mt-1 font-pretendard text-normal-regular text-neutral-black2">
              {config.description}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="mt-5 flex-row items-start justify-between">
        {config.steps.map((step, index) => (
          <StepGroup
            key={`${step.label}-${index}`}
            nextActive={step.state === "done"}
            showLine={index < config.steps.length - 1}
            step={step}
          />
        ))}
      </View>

      {config.type === "primary" && config.actionLabel ? (
        <Pressable
          accessibilityRole="button"
          className="mt-5 h-12 items-center justify-center rounded-lg bg-erum-primary"
          onPress={onPressPrimary}
        >
          <Text className="font-pretendard text-large-bold text-neutral-white">
            {config.actionLabel}
          </Text>
        </Pressable>
      ) : null}

      {config.type === "dual" ? (
        <View className="mt-5 flex-row gap-2">
          <Pressable
            accessibilityRole="button"
            className="h-12 flex-1 items-center justify-center rounded-lg bg-erum-primary"
            onPress={onPressAccept}
          >
            <Text className="font-pretendard text-large-bold text-neutral-white">
              결제 수락
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            className="h-12 flex-1 items-center justify-center rounded-lg bg-state-error"
            onPress={onPressReject}
          >
            <Text className="font-pretendard text-large-bold text-neutral-white">
              결제 거절
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

export function PaymentProgressCardSkeleton() {
  return (
    <View className="rounded-xl border border-[#FFE1B7] bg-[#FFF3DF] p-4">
      <View className="flex-row items-center gap-2">
        <Skeleton width={28} height={28} rounded="full" />
        <Skeleton width="58%" height={16} />
      </View>
      <View className="mt-5 flex-row items-center justify-between">
        <Skeleton width={42} height={42} rounded="full" />
        <Skeleton width="22%" height={2} />
        <Skeleton width={42} height={42} rounded="full" />
        <Skeleton width="22%" height={2} />
        <Skeleton width={42} height={42} rounded="full" />
      </View>
      <View className="mt-5">
        <Skeleton height={48} rounded="lg" />
      </View>
    </View>
  );
}

function StepGroup({
  nextActive,
  showLine,
  step,
}: {
  nextActive: boolean;
  showLine: boolean;
  step: ProgressStepItem;
}) {
  return (
    <>
      <ProgressStep step={step} />
      {showLine ? <ProgressLine active={nextActive} /> : null}
    </>
  );
}

function ProgressStep({ step }: { step: ProgressStepItem }) {
  const isDone = step.state === "done";
  const isFailed = step.state === "failed";

  return (
    <View className="w-[58px] items-center">
      <View
        className={`h-9 w-9 items-center justify-center rounded-full ${
          isFailed
            ? "bg-state-error"
            : isDone
              ? "bg-erum-primary"
              : "bg-[#D6DDE6]"
        }`}
      >
        <Text className="font-pretendard text-normal-bold text-neutral-white">
          {isFailed ? "×" : isDone ? "✓" : step.value}
        </Text>
      </View>
      <Text className="mt-2 text-center font-pretendard text-normal-regular text-neutral-black2">
        {step.label}
      </Text>
    </View>
  );
}

function ProgressLine({ active = false }: { active?: boolean }) {
  return (
    <View className="mt-[18px] h-[2px] min-w-0 flex-1">
      <View
        className={`h-full ${active ? "bg-erum-primary" : "bg-neutral-grey1"}`}
      />
    </View>
  );
}

function getPaymentProgressConfig({
  participantName,
  variant,
}: {
  participantName?: string;
  variant: PaymentProgressVariant;
}): PaymentProgressConfig {
  switch (variant) {
    case "DUTCHPAY_OWNER_GROUP_CREATE_READY":
      return {
        actionLabel: "더치페이 그룹 생성하기 >",
        steps: buildSteps(dutchpayOwnerLabels, [
          "pending",
          "pending",
          "pending",
          "pending",
        ]),
        title: "그룹을 만들어 더치페이를 시작하세요!",
        tone: "default",
        type: "primary",
      };

    case "DUTCHPAY_OWNER_MEMBER_CONFIRM_READY":
      return {
        actionLabel: "인원 확정하기 >",
        steps: buildSteps(dutchpayOwnerLabels, [
          "done",
          "pending",
          "pending",
          "pending",
        ]),
        title: "더치페이 참여자를 확인해주세요!",
        tone: "default",
        type: "primary",
      };

    case "DUTCHPAY_OWNER_AMOUNT_CONFIRM_READY":
      return {
        actionLabel: "금액 확정하기 >",
        steps: buildSteps(dutchpayOwnerLabels, [
          "done",
          "done",
          "pending",
          "pending",
        ]),
        title: "참여자들의 금액을 확인해주세요!",
        tone: "default",
        type: "primary",
      };

    case "DUTCHPAY_OWNER_PAYMENT_REQUEST_READY":
      return {
        actionLabel: "결제 요청하기 >",
        steps: buildSteps(dutchpayOwnerLabels, [
          "done",
          "done",
          "done",
          "pending",
        ]),
        title: "참여자에게 결제를 요청해보세요!",
        tone: "default",
        type: "primary",
      };

    case "DUTCHPAY_OWNER_WAITING_MEMBERS":
      return {
        actionLabel: "결제 전체 상태 보기 >",
        description: "팀원들이 아직 결제를 진행중이에요.",
        steps: buildSteps(dutchpayOwnerLabels, [
          "done",
          "done",
          "done",
          "pending",
        ]),
        title: "더치페이가 진행중이에요!",
        tone: "default",
        type: "primary",
      };

    case "DUTCHPAY_OWNER_FINAL_PAYMENT_READY":
      return {
        actionLabel: "최종 결제 진행하기 >",
        description: "팀원들의 결제가 완료 되었어요.",
        steps: buildSteps(dutchpayOwnerLabels, [
          "done",
          "done",
          "done",
          "pending",
        ]),
        title: "더치페이가 진행중이에요!",
        tone: "default",
        type: "primary",
      };

    case "DUTCHPAY_OWNER_COMPLETED":
      return {
        steps: buildSteps(dutchpayOwnerLabels, [
          "done",
          "done",
          "done",
          "done",
        ]),
        title: "더치페이가 완료 되었어요!",
        tone: "default",
        type: "none",
      };

    case "DUTCHPAY_MEMBER_REQUEST_RECEIVED":
      return {
        actionLabel: "더치페이 수락하기 >",
        steps: buildSteps(dutchpayMemberLabels, [
          "pending",
          "pending",
          "pending",
          "pending",
        ]),
        title: "더치페이 요청이 도착했습니다!",
        tone: "default",
        type: "primary",
      };

    case "DUTCHPAY_MEMBER_AMOUNT_INPUT_READY":
      return {
        actionLabel: "금액 입력하기 >",
        steps: buildSteps(dutchpayMemberLabels, [
          "done",
          "pending",
          "pending",
          "pending",
        ]),
        title: "더치페이 금액을 입력하세요!",
        tone: "default",
        type: "primary",
      };

    case "DUTCHPAY_MEMBER_PAYMENT_READY":
      return {
        actionLabel: "결제 진행하기 >",
        steps: buildSteps(dutchpayMemberLabels, [
          "done",
          "done",
          "pending",
          "pending",
        ]),
        title: "더치페이 결제를 진행하세요!",
        tone: "default",
        type: "primary",
      };

    case "DUTCHPAY_MEMBER_WAITING_OTHERS":
      return {
        actionLabel: "결제 전체 상태 보기 >",
        description: "참여자들이 아직 결제를 진행중이에요.",
        steps: buildSteps(dutchpayMemberLabels, [
          "done",
          "done",
          "done",
          "pending",
        ]),
        title: "더치페이가 진행중이에요.",
        tone: "default",
        type: "primary",
      };

    case "DUTCHPAY_MEMBER_COMPLETED":
      return {
        steps: buildSteps(dutchpayMemberLabels, [
          "done",
          "done",
          "done",
          "done",
        ]),
        title: "더치페이가 완료 되었어요!",
        tone: "default",
        type: "none",
      };

    case "REMOTE_OUTGOING_REQUEST_SENT":
      return {
        steps: buildSteps(remoteOutgoingLabels, ["done", "pending", "pending"]),
        title: `${getRemoteOutgoingName(participantName)}님에게 결제 요청을 보냈어요!`,
        tone: "default",
        type: "none",
      };

    case "REMOTE_OUTGOING_REQUEST_ACCEPTED":
      return {
        steps: buildSteps(remoteOutgoingLabels, ["done", "done", "pending"]),
        title: `${getRemoteOutgoingName(participantName)}님이 결제 요청을 수락했어요!`,
        tone: "default",
        type: "none",
      };

    case "REMOTE_OUTGOING_PAYMENT_COMPLETED":
      return {
        steps: buildSteps(remoteOutgoingLabels, ["done", "done", "done"]),
        title: `${getRemoteOutgoingName(participantName)}님이 결제를 완료했어요!`,
        tone: "default",
        type: "none",
      };

    case "REMOTE_OUTGOING_REQUEST_REJECTED":
      return {
        steps: buildSteps(remoteRejectedLabels, ["done", "failed", "pending"]),
        title: `${getRemoteOutgoingName(participantName)}님이 결제를 거절했어요`,
        tone: "danger",
        type: "none",
      };

    case "REMOTE_INCOMING_REQUEST_RECEIVED":
      return {
        steps: buildSteps(remoteIncomingLabels, ["done", "pending", "pending"]),
        title: `${getRemoteIncomingName(participantName)}님의 결제 요청이 도착했어요!`,
        tone: "default",
        type: "dual",
      };

    case "REMOTE_INCOMING_REQUEST_ACCEPTED":
      return {
        actionLabel: "결제 이어서 진행하기 >",
        steps: buildSteps(remoteIncomingLabels, ["done", "done", "pending"]),
        title: `${getRemoteIncomingName(participantName)}님의 결제 요청을 수락했어요!`,
        tone: "default",
        type: "primary",
      };

    case "REMOTE_INCOMING_PAYMENT_COMPLETED":
      return {
        steps: buildSteps(remoteIncomingLabels, ["done", "done", "done"]),
        title: "원격 결제를 완료했어요.",
        tone: "default",
        type: "none",
      };

    case "REMOTE_INCOMING_REQUEST_REJECTED":
      return {
        steps: buildSteps(remoteRejectedLabels, ["done", "failed", "pending"]),
        title: "원격 결제를 거절했어요.",
        tone: "danger",
        type: "none",
      };
  }
}

function getRemoteOutgoingName(participantName?: string) {
  return participantName ?? "나성희(3242)";
}

function getRemoteIncomingName(participantName?: string) {
  return participantName ?? "김이름(6653)";
}

function buildSteps(
  labels: string[],
  states: ProgressStepState[],
): ProgressStepItem[] {
  return labels.map((label, index) => ({
    label,
    state: states[index] ?? "pending",
    value: String(index + 1),
  }));
}

export default PaymentProgressCard;
