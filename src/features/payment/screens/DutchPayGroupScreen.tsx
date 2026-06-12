import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import type { RootStackParamList } from '../../../../App';
import Button from '../../../shared/components/Button';
import Header from '../../../shared/components/Header';
import Modal from '../../../shared/components/Modal';
import NoticeBox from '../../../shared/components/NoticeBox';
import PageWrap from '../../../shared/components/PageWrap';
import { Toast } from '../../../shared/components/Toast';
import DutchPayMemberRow from '../components/DutchPayMemberRow';
import DutchPayTotalNotice from '../components/DutchPayTotalNotice';
import PaymentMockBadge from '../components/PaymentMockBadge';
import PaymentStopConfirmModal from '../components/PaymentStopConfirmModal';
import { getMockDutchPayGroupData } from '../constants/dutchPay.mock';
import { fetchAuthFriends } from '../../friend/api/friendApi';
import {
  fetchUserProfile,
  fetchUserProfileById,
} from '../../mypage/api/mypageApi';
import type { PaymentRequestSummary } from '../types/paymentMethod.types';
import type {
  DutchPayGroupData,
  DutchPayMember,
  DutchPayScenario,
} from '../types/dutchPay.types';
import {
  cancelDutchPaySession,
  confirmDutchPayParticipants,
  getDutchPaySession,
  rejectDutchPayInvite,
  removeDutchPayParticipant,
  updateDutchPayMyAmount,
  type DutchPayParticipantResponse,
  type DutchPaySessionDetailResponse,
} from '../api/dutchPayApi';
import { getPaymentUserId } from '../api/paymentApiConfig';
import {
  addRequestedDutchPaySession,
  getRequestedDutchPaySessionIdSet,
} from '../utils/requestedDutchPaySessions';
import {
  addConfirmedDutchPayAmountSession,
  getConfirmedDutchPayAmountSessionIdSet,
} from '../utils/confirmedDutchPayAmountSessions';
import { useDutchPayProgressUserStore } from '../stores/useDutchPayProgressUserStore';

type Props = NativeStackScreenProps<RootStackParamList, 'DutchPayGroup'>;
type DutchPayUserSummary = {
  name: string;
  phoneSuffix: string;
};

const nextScenarioByScenario = {
  OWNER_INITIAL: 'OWNER_AUTO_SPLIT_READY',
  OWNER_AUTO_SPLIT_READY: 'OWNER_AMOUNT_INPUT_COMPLETE',
  OWNER_AMOUNT_INPUT_WAITING: 'OWNER_AMOUNT_INPUT_COMPLETE',
  OWNER_AMOUNT_INPUT_COMPLETE: 'OWNER_PAYMENT_REQUEST',
  OWNER_PAYMENT_REQUEST: 'OWNER_PAYMENT_PROGRESS',
  OWNER_PAYMENT_PROGRESS: 'OWNER_FINAL_PAYMENT_READY',
  OWNER_FINAL_PAYMENT_READY: 'OWNER_FINAL_PAYMENT_READY',
  OWNER_FINAL_PAYMENT_FAILURE: 'OWNER_FINAL_PAYMENT_READY',
  PARTICIPANT_INITIAL: 'PARTICIPANT_AMOUNT_INPUT',
  PARTICIPANT_AMOUNT_INPUT: 'PARTICIPANT_AMOUNT_REVIEW',
  PARTICIPANT_AMOUNT_REVIEW: 'PARTICIPANT_PAYMENT_REQUEST',
  PARTICIPANT_PAYMENT_PROGRESS: 'PARTICIPANT_FINAL_PAYMENT_PROGRESS',
  PARTICIPANT_PAYMENT_REQUEST: 'PARTICIPANT_PAYMENT_PROGRESS',
  PARTICIPANT_FINAL_PAYMENT_PROGRESS: 'PARTICIPANT_FINAL_PAYMENT_PROGRESS',
} as const;

function getHeaderTitle(scenario: DutchPayScenario) {
  if (
    scenario === 'OWNER_PAYMENT_REQUEST' ||
    scenario === 'PARTICIPANT_AMOUNT_REVIEW'
  ) {
    return '더치페이 결제 금액 확인중';
  }

  if (
    scenario === 'OWNER_FINAL_PAYMENT_READY' ||
    scenario === 'OWNER_PAYMENT_PROGRESS' ||
    scenario === 'OWNER_FINAL_PAYMENT_FAILURE' ||
    scenario === 'PARTICIPANT_PAYMENT_REQUEST' ||
    scenario === 'PARTICIPANT_PAYMENT_PROGRESS' ||
    scenario === 'PARTICIPANT_FINAL_PAYMENT_PROGRESS'
  ) {
    return '더치페이 결제 진행중';
  }

  if (
    scenario === 'OWNER_AUTO_SPLIT_READY' ||
    scenario === 'OWNER_AMOUNT_INPUT_WAITING' ||
    scenario === 'OWNER_AMOUNT_INPUT_COMPLETE'
  ) {
    return '더치페이 결제 금액 확인';
  }

  if (scenario === 'PARTICIPANT_AMOUNT_INPUT') {
    return '더치페이 결제 금액 입력';
  }

  return '더치페이 결제 그룹 참여';
}

function toFiniteNumber(value: unknown) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsedValue = Number(value);

    return Number.isFinite(parsedValue) ? parsedValue : undefined;
  }

  return undefined;
}

function parseAmount(value?: string) {
  return Number((value ?? '').replace(/[^0-9]/g, '')) || 0;
}

function formatEditableAmount(value: string) {
  return parseAmount(value).toLocaleString('ko-KR');
}

function getPhoneSuffix(value?: string) {
  const digits = (value ?? '').replace(/[^0-9]/g, '');

  return digits.slice(-4);
}

function parseServerDateTime(value?: string | null) {
  if (!value) {
    return null;
  }

  const normalizedValue = /(?:Z|[+-]\d{2}:?\d{2})$/.test(value)
    ? value
    : `${value}Z`;
  const parsedValue = Date.parse(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function isDutchPayTimedOut(session: DutchPaySessionDetailResponse) {
  if (
    session.status === 'TIMEOUT_HANDLED' ||
    session.session_progress_step === 'TIMEOUT_HANDLED'
  ) {
    return true;
  }

  const timeoutAt = parseServerDateTime(session.timeout_at ?? session.timeoutAt);

  if (timeoutAt != null && Date.now() >= timeoutAt) {
    return true;
  }

  const expiresAt = parseServerDateTime(session.expires_at ?? session.expiresAt);

  return expiresAt != null && Date.now() >= expiresAt;
}

function createDutchPayPaymentSummary({
  amount,
  paymentId,
}: {
  amount: number;
  paymentId: number;
}): PaymentRequestSummary {
  return {
    paymentId,
    merchantName: '롯데시네마 홍대입구점',
    amount,
    type: 'DUTCH_PAY_PARTICIPANT',
    dutchPayOwnerName: '김지지',
  };
}

function applyFailedPaymentAmountToOwner(
  members: DutchPayMember[],
): DutchPayMember[] {
  const failedAmount = members
    .filter((member) => !member.isOwner && member.status === 'PAYMENT_FAILED')
    .reduce((total, member) => total + (member.amount ?? 0), 0);

  if (failedAmount === 0) {
    return members;
  }

  return members.map((member) =>
    member.isOwner
      ? {
          ...member,
          amount: (member.amount ?? 0) + failedAmount,
        }
    : member,
  );
}

function toDutchPayScenario(
  session: DutchPaySessionDetailResponse,
  role: 'OWNER' | 'PARTICIPANT',
  currentUserId: number,
  routeSplitType?: 'AUTO_SPLIT' | 'MANUAL',
): DutchPayScenario {
  const isEqualSplit =
    session.split_method === 'EQUAL' || routeSplitType === 'AUTO_SPLIT';
  const activeParticipants = session.participants.filter(
    (participant) => participant.status !== 'REJECTED',
  );
  const currentParticipant = activeParticipants.find(
    (participant) => participant.user_id === currentUserId,
  );

  const hasActiveParticipantBeyondOwner = activeParticipants.some(
    (participant) => !participant.host,
  );

  if (role === 'OWNER' && !hasActiveParticipantBeyondOwner) {
    return 'OWNER_INITIAL';
  }

  if (role === 'PARTICIPANT') {
    switch (session.session_progress_step) {
      case 'AMOUNT_INPUT':
        return 'PARTICIPANT_AMOUNT_INPUT';
      case 'PAYMENT_REQUEST':
        if (currentParticipant?.status === 'PAID') {
          return 'PARTICIPANT_PAYMENT_PROGRESS';
        }

        return 'PARTICIPANT_PAYMENT_REQUEST';
      case 'PAYMENT_IN_PROGRESS':
        if (currentParticipant?.status === 'PAID') {
          return 'PARTICIPANT_PAYMENT_PROGRESS';
        }

        return 'PARTICIPANT_PAYMENT_REQUEST';
      case 'FINAL_PAYMENT_REQUIRED':
      case 'TIMEOUT_HANDLED':
      case 'COMPLETED':
        return 'PARTICIPANT_FINAL_PAYMENT_PROGRESS';
      default:
        return 'PARTICIPANT_INITIAL';
    }
  }

  switch (session.session_progress_step) {
    case 'PARTICIPANT_CONFIRM':
      return 'OWNER_INITIAL';
    case 'AMOUNT_INPUT':
      if (isEqualSplit) {
        return 'OWNER_AMOUNT_INPUT_COMPLETE';
      }

      return 'OWNER_AMOUNT_INPUT_WAITING';
    case 'PAYMENT_REQUEST':
      return 'OWNER_AMOUNT_INPUT_COMPLETE';
    case 'PAYMENT_IN_PROGRESS':
      return 'OWNER_PAYMENT_PROGRESS';
    case 'FINAL_PAYMENT_REQUIRED':
    case 'TIMEOUT_HANDLED':
    case 'COMPLETED':
      return 'OWNER_FINAL_PAYMENT_READY';
    case 'FAILED':
      return 'OWNER_FINAL_PAYMENT_FAILURE';
    case 'GROUP_CREATED':
    default:
      return 'OWNER_INITIAL';
  }
}

function toDutchPayMemberStatus(participant: DutchPayParticipantResponse) {
  if (participant.status === 'PAID' || participant.status === 'HOST_PAID') {
    return 'PAYMENT_COMPLETED' as const;
  }

  if (participant.status === 'TIMEOUT') {
    return 'PAYMENT_FAILED' as const;
  }

  if (participant.payment_id != null) {
    return 'PAYMENT_PENDING' as const;
  }

  if (participant.amount != null) {
    if (participant.host) {
      return 'EMPTY' as const;
    }

    return 'AMOUNT_CONFIRMED' as const;
  }

  if (participant.host) {
    return 'EMPTY' as const;
  }

  if (participant.status === 'PENDING') {
    return 'WAITING_AMOUNT' as const;
  }

  return 'EMPTY' as const;
}

function toOwnerPaymentProgressMember(member: DutchPayMember): DutchPayMember {
  if (member.isOwner) {
    return member;
  }

  if (
    member.status === 'PAYMENT_COMPLETED' ||
    member.status === 'PAYMENT_FAILED' ||
    member.status === 'PAYMENT_PENDING'
  ) {
    return member;
  }

  return {
    ...member,
    status: 'PAYMENT_PENDING',
  };
}

function toDutchPayMember(
  participant: DutchPayParticipantResponse,
  currentUserId: number,
  userSummaries: Record<number, DutchPayUserSummary> = {},
): DutchPayMember {
  const userSummary = userSummaries[participant.user_id];
  const name =
    userSummary?.name ??
    (participant.host ? '대표자' : `참여자 ${participant.user_id}`);
  const phoneSuffix =
    userSummary?.phoneSuffix ||
    String(participant.user_id).padStart(4, '0').slice(-4);

  return {
    id: String(participant.participant_id),
    name,
    phoneSuffix,
    initial: name.slice(0, 1),
    isOwner: participant.host,
    isMe: participant.user_id === currentUserId,
    amount: participant.amount ?? undefined,
    status: toDutchPayMemberStatus(participant),
    canOpenMenu: !participant.host,
  };
}

function toDutchPayGroupData(
  session: DutchPaySessionDetailResponse,
  role: 'OWNER' | 'PARTICIPANT',
  currentUserId: number,
  routeSplitType?: 'AUTO_SPLIT' | 'MANUAL',
  userSummaries: Record<number, DutchPayUserSummary> = {},
): DutchPayGroupData {
  const scenario = toDutchPayScenario(session, role, currentUserId, routeSplitType);
  const canEditMembers = role === 'OWNER' && scenario === 'OWNER_INITIAL';
  const members = session.participants
    .filter((participant) => participant.status !== 'REJECTED')
    .map((participant) =>
    {
      const member = toDutchPayMember(participant, currentUserId, userSummaries);
      return {
        ...member,
        canOpenMenu: canEditMembers && !member.isOwner,
      };
    },
  );

  return {
    role,
    scenario,
    totalAmount: session.total_amount,
    members,
    footer: getServerFooter(scenario),
  };
}

function getServerFooter(scenario: DutchPayScenario) {
  if (scenario === 'OWNER_FINAL_PAYMENT_READY') {
    return {
      type: 'button' as const,
      label: '최종 결제하기',
    };
  }

  if (scenario === 'OWNER_PAYMENT_PROGRESS') {
    return {
      type: 'button' as const,
      label: '최종 결제하기',
      disabled: true,
    };
  }

  if (scenario === 'OWNER_INITIAL') {
    return {
      type: 'button' as const,
      label: '인원 확정하기',
      secondaryLabel: '더치페이 그룹 취소하기',
    };
  }

  if (scenario === 'OWNER_AMOUNT_INPUT_WAITING') {
    return {
      type: 'button' as const,
      label: '금액 확정하기',
    };
  }

  if (scenario === 'OWNER_AMOUNT_INPUT_COMPLETE') {
    return {
      type: 'button' as const,
      label: '더치페이 금액 확정하기',
    };
  }

  if (scenario === 'OWNER_PAYMENT_REQUEST') {
    return {
      type: 'button' as const,
      label: '참여자에게 결제 요청하기',
    };
  }

  if (scenario === 'PARTICIPANT_AMOUNT_INPUT') {
    return {
      type: 'button' as const,
      label: '금액 확정하기',
      secondaryLabel: '더치페이 그룹 나가기',
    };
  }

  if (scenario === 'PARTICIPANT_AMOUNT_REVIEW') {
    return {
      type: 'notice' as const,
      tone: 'info' as const,
      message: '대표자가 결제 금액 확인을 하고 있습니다.',
    };
  }

  if (scenario === 'PARTICIPANT_INITIAL') {
    return {
      type: 'button' as const,
      label: '더치페이 그룹 나가기',
    };
  }

  if (scenario === 'PARTICIPANT_PAYMENT_REQUEST') {
    return {
      type: 'button' as const,
      label: '결제 진행하기',
    };
  }

  if (scenario === 'PARTICIPANT_PAYMENT_PROGRESS') {
    return {
      type: 'notice' as const,
      tone: 'info' as const,
      message: '그룹원들이 결제를 진행하고 있습니다.',
    };
  }

  if (scenario === 'PARTICIPANT_FINAL_PAYMENT_PROGRESS') {
    return {
      type: 'notice' as const,
      tone: 'info' as const,
      message: '대표자가 결제를 진행하고 있습니다.',
    };
  }

  return {
    type: 'notice' as const,
    tone: 'info' as const,
    message: '더치페이 진행 상태를 확인 중입니다.',
  };
}

export default function DutchPayGroupScreen({ navigation, route }: Props) {
  const role = route.params?.role ?? 'OWNER';
  const scenario = route.params?.scenario;
  const splitType = route.params?.splitType ?? 'MANUAL';
  const sessionId = toFiniteNumber(route.params?.sessionId);
  const routeUserId = toFiniteNumber(route.params?.userId);
  const merchantId = toFiniteNumber(route.params?.merchantId);
  const isServerMode = typeof sessionId === 'number';
  const appUserId = routeUserId ?? (Number(getPaymentUserId()) || 1);
  const currentUserId = appUserId;
  const setDutchPayProgressUserId = useDutchPayProgressUserStore(
    (state) => state.setUserId,
  );
  const resolvedSplitMethod =
    route.params?.splitMethod ?? (splitType === 'AUTO_SPLIT' ? 'EQUAL' : 'CUSTOM');
  const [serverSession, setServerSession] =
    useState<DutchPaySessionDetailResponse | null>(null);
  const [userSummaries, setUserSummaries] = useState<
    Record<number, DutchPayUserSummary>
  >({});
  const [serverErrorMessage, setServerErrorMessage] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLeavingForPayment, setIsLeavingForPayment] = useState(false);
  const [isAmountConfirmed, setIsAmountConfirmed] = useState(false);
  const [isPaymentRequestSent, setIsPaymentRequestSent] = useState(false);
  const [forcedScenario, setForcedScenario] = useState<DutchPayScenario | null>(
    isServerMode ? scenario ?? null : null,
  );
  const [timeoutModalVisible, setTimeoutModalVisible] = useState(false);
  const isPollingSessionRef = useRef(false);
  const previousPaymentRequestSentRef = useRef(false);
  const participantPaymentCompleteModalShownRef = useRef(false);
  const sessionClosedModalShownRef = useRef(false);
  const timeoutModalShownRef = useRef(false);
  const data = useMemo(
    () => {
      const nextData = serverSession
        ? toDutchPayGroupData(
            serverSession,
            role,
            currentUserId,
            splitType,
            userSummaries,
          )
        : getMockDutchPayGroupData({ role, scenario });

      if (
        !forcedScenario ||
        nextData.scenario !== 'OWNER_AMOUNT_INPUT_COMPLETE'
      ) {
        if (
          isPaymentRequestSent &&
          nextData.scenario === 'OWNER_AMOUNT_INPUT_COMPLETE'
        ) {
          return {
            ...nextData,
            scenario: 'OWNER_PAYMENT_PROGRESS' as const,
            footer: getServerFooter('OWNER_PAYMENT_PROGRESS'),
            members: nextData.members.map(toOwnerPaymentProgressMember),
          };
        }

        if (
          isAmountConfirmed &&
          nextData.scenario === 'OWNER_AMOUNT_INPUT_COMPLETE'
        ) {
          return {
            ...nextData,
            scenario: 'OWNER_PAYMENT_REQUEST' as const,
            footer: getServerFooter('OWNER_PAYMENT_REQUEST'),
          };
        }

        if (
          isPaymentRequestSent &&
          nextData.scenario === 'PARTICIPANT_AMOUNT_REVIEW'
        ) {
          return {
            ...nextData,
            scenario: 'PARTICIPANT_PAYMENT_REQUEST' as const,
            footer: getServerFooter('PARTICIPANT_PAYMENT_REQUEST'),
          };
        }

        if (
          isAmountConfirmed &&
          nextData.scenario === 'PARTICIPANT_AMOUNT_INPUT'
        ) {
          return {
            ...nextData,
            scenario: 'PARTICIPANT_AMOUNT_REVIEW' as const,
            footer: getServerFooter('PARTICIPANT_AMOUNT_REVIEW'),
          };
        }

        return nextData;
      }

      return {
        ...nextData,
        scenario: forcedScenario,
        footer: getServerFooter(forcedScenario),
        members:
          forcedScenario === 'OWNER_PAYMENT_PROGRESS'
            ? nextData.members.map(toOwnerPaymentProgressMember)
            : nextData.members,
      };
    },
    [
      currentUserId,
      forcedScenario,
      isAmountConfirmed,
      isPaymentRequestSent,
      role,
      scenario,
      serverSession,
      splitType,
      userSummaries,
    ],
  );
  const [openMenuMemberId, setOpenMenuMemberId] = useState<string | null>(null);
  const [members, setMembers] = useState<DutchPayMember[]>(data.members);
  const [toastVisible, setToastVisible] = useState(false);
  const [stopModalVisible, setStopModalVisible] = useState(false);
  const [cancelGroupModalVisible, setCancelGroupModalVisible] = useState(false);
  const [leaveGroupModalVisible, setLeaveGroupModalVisible] = useState(false);
  const [paymentCompleteModalVisible, setPaymentCompleteModalVisible] =
    useState(false);

  const isParticipantAmountInputScenario =
    data.scenario === 'PARTICIPANT_AMOUNT_INPUT';
  const isParticipantAmountReviewScenario =
    data.scenario === 'PARTICIPANT_AMOUNT_REVIEW';
  const isParticipantPaymentRequestScenario =
    data.scenario === 'PARTICIPANT_PAYMENT_REQUEST';
  const myParticipantPaymentId = useMemo(() => {
    if (!serverSession) {
      return undefined;
    }

    return serverSession.participants.find(
      (participant) => participant.user_id === currentUserId && !participant.host,
    )?.payment_id ?? undefined;
  }, [currentUserId, serverSession]);
  const isMyParticipantPaymentCompleted = useMemo(() => {
    if (!serverSession || role !== 'PARTICIPANT') {
      return false;
    }

    return serverSession.participants.some(
      (participant) =>
        participant.user_id === currentUserId &&
        !participant.host &&
        participant.status === 'PAID',
    );
  }, [currentUserId, role, serverSession]);
  const isAutoSplitParticipantInput =
    isParticipantAmountInputScenario && splitType === 'AUTO_SPLIT';
  const visibleMembers = role === 'OWNER' ? data.members : members;
  const participantMembers = visibleMembers.filter((member) => !member.isOwner);
  const failedPaymentMembers = participantMembers.filter(
    (member) => member.status === 'PAYMENT_FAILED',
  );
  const confirmedParticipantAmount = participantMembers.reduce(
    (total, member) =>
      member.status === 'AMOUNT_CONFIRMED' ? total + (member.amount ?? 0) : total,
    0,
  );
  const assignedParticipantAmount = participantMembers.reduce(
    (total, member) => total + (member.amount ?? 0),
    0,
  );
  const isParticipantAmountOverLimit =
    Math.max(confirmedParticipantAmount, assignedParticipantAmount) >
    data.totalAmount;
  const isOwnerAmountCheckScenario =
    data.scenario === 'OWNER_AMOUNT_INPUT_WAITING' ||
    data.scenario === 'OWNER_AMOUNT_INPUT_COMPLETE' ||
    data.scenario === 'OWNER_PAYMENT_REQUEST';
  const ownerAmount = Math.max(
    data.totalAmount -
      (isOwnerAmountCheckScenario ? confirmedParticipantAmount : assignedParticipantAmount),
    0,
  );
  const allParticipantsConfirmed =
    participantMembers.length > 0 &&
    participantMembers.every((member) => member.status === 'AMOUNT_CONFIRMED');
  const isOwnerFinalPaymentScenario =
    data.scenario === 'OWNER_FINAL_PAYMENT_READY' ||
    data.scenario === 'OWNER_FINAL_PAYMENT_FAILURE';
  const myMember = visibleMembers.find((member) => member.isMe);
  const myEditableAmount = parseAmount(myMember?.editableAmount);
  const isMyAmountConfirmed =
    myMember?.status === 'AMOUNT_CONFIRMED' && typeof myMember.amount === 'number';
  const displayMembers = applyFailedPaymentAmountToOwner(
    visibleMembers.map((member) => {
      if (
        member.isOwner &&
        (isOwnerAmountCheckScenario ||
          isParticipantAmountInputScenario ||
          isParticipantAmountReviewScenario ||
          isParticipantPaymentRequestScenario)
      ) {
        return {
          ...member,
          amount: ownerAmount,
          status: 'AMOUNT_CONFIRMED',
          showAmountCheck:
            data.scenario === 'OWNER_AMOUNT_INPUT_COMPLETE' ||
            data.scenario === 'OWNER_PAYMENT_REQUEST' ||
            isParticipantAmountReviewScenario ||
            isParticipantPaymentRequestScenario ||
            (isParticipantAmountInputScenario && allParticipantsConfirmed),
        };
      }

      if (
        isParticipantAmountReviewScenario &&
        member.isMe &&
        member.status === 'AMOUNT_CONFIRMED'
      ) {
        return {
          ...member,
          status: 'AMOUNT_REVIEW',
          showAmountCheck: true,
        };
      }

      if (member.isOwner && isOwnerFinalPaymentScenario) {
        return {
          ...member,
          amount: ownerAmount,
          status: 'AMOUNT_CONFIRMED',
          showAmountCheck: true,
        };
      }

      return member;
    }),
  );
  const primaryDisabled =
    data.footer.type === 'button' &&
    (isSyncing ||
      (data.footer.disabled && !isOwnerAmountCheckScenario) ||
      (isOwnerFinalPaymentScenario && isParticipantAmountOverLimit) ||
      (isOwnerAmountCheckScenario && isParticipantAmountOverLimit) ||
      (isOwnerAmountCheckScenario && !allParticipantsConfirmed) ||
      (isParticipantAmountInputScenario &&
        !isMyAmountConfirmed &&
        myEditableAmount < 1));
  const primaryLabel =
    isParticipantAmountInputScenario && isMyAmountConfirmed
      ? '금액 수정하기'
      : data.footer.type === 'button'
        ? data.footer.label
        : '';
  const shouldShowSecondaryAction =
    data.footer.type === 'button' &&
    data.footer.secondaryLabel &&
    !(
      isServerMode &&
      role === 'PARTICIPANT' &&
      data.scenario === 'PARTICIPANT_AMOUNT_INPUT'
    );
  const ownerDisplayAmount =
    displayMembers.find((member) => member.isOwner)?.amount ?? ownerAmount;
  const myPaymentAmount =
    displayMembers.find((member) => member.isMe)?.amount ?? myEditableAmount;

  const navigateToDutchPayMethodSelect = useCallback(
    (amount: number) => {
      navigation.navigate('PaymentMethodSelect', {
        summary: createDutchPayPaymentSummary({
          paymentId: role === 'OWNER' ? 1347001 : 1347002,
          amount,
        }),
      });
    },
    [navigation, role],
  );

  const refreshServerSession = useCallback(async () => {
    if (sessionId == null) {
      return;
    }

    const nextSession = await getDutchPaySession(sessionId, currentUserId);
    const [confirmedSessionIds, requestedSessionIds] = await Promise.allSettled([
      getConfirmedDutchPayAmountSessionIdSet(),
      getRequestedDutchPaySessionIdSet(),
    ]);

    if (confirmedSessionIds.status === 'fulfilled') {
      setIsAmountConfirmed(confirmedSessionIds.value.has(sessionId));
    }

    if (requestedSessionIds.status === 'fulfilled') {
      setIsPaymentRequestSent(requestedSessionIds.value.has(sessionId));
    }

    setServerSession(nextSession);
  }, [currentUserId, sessionId]);

  useEffect(() => {
    if (isServerMode) {
      setDutchPayProgressUserId(currentUserId);
    }
  }, [currentUserId, isServerMode, setDutchPayProgressUserId]);

  useEffect(() => {
    if (sessionId == null) {
      setIsAmountConfirmed(false);
      setIsPaymentRequestSent(false);
      return;
    }

    let isMounted = true;

    Promise.allSettled([
      getConfirmedDutchPayAmountSessionIdSet(),
      getRequestedDutchPaySessionIdSet(),
    ])
      .then(([confirmedSessionIds, requestedSessionIds]) => {
        if (isMounted) {
          setIsAmountConfirmed(
            confirmedSessionIds.status === 'fulfilled' &&
              confirmedSessionIds.value.has(sessionId),
          );
          setIsPaymentRequestSent(
            requestedSessionIds.status === 'fulfilled' &&
              requestedSessionIds.value.has(sessionId),
          );
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsAmountConfirmed(false);
          setIsPaymentRequestSent(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  useEffect(() => {
    if (!isServerMode) {
      return;
    }

    let isMounted = true;

    const loadUserSummaries = async () => {
      const nextSummaries: Record<number, DutchPayUserSummary> = {};

      try {
        const profile = await fetchUserProfile();

        if (currentUserId === appUserId) {
          nextSummaries[currentUserId] = {
            name: profile.name,
            phoneSuffix:
              getPhoneSuffix(profile.phone) ||
              String(currentUserId).padStart(4, '0').slice(-4),
          };
        }
      } catch {
        // 프로필 조회 실패 시 서버 participant user_id 기반 fallback을 사용합니다.
      }

      try {
        const friends = await fetchAuthFriends();

        friends.forEach((friend) => {
          nextSummaries[friend.userId] = {
            name: friend.name || `참여자 ${friend.userId}`,
            phoneSuffix:
              friend.phoneLastFour ||
              String(friend.userId).padStart(4, '0').slice(-4),
          };
        });
      } catch {
        // 친구 목록 조회 실패 시 서버 participant user_id 기반 fallback을 사용합니다.
      }

      if (isMounted) {
        setUserSummaries(nextSummaries);
      }
    };

    void loadUserSummaries();

    return () => {
      isMounted = false;
    };
  }, [appUserId, currentUserId, isServerMode]);

  useEffect(() => {
    if (!isServerMode || !serverSession) {
      return;
    }

    let isMounted = true;

    const loadParticipantUserSummaries = async () => {
      const userIds = Array.from(
        new Set(serverSession.participants.map((participant) => participant.user_id)),
      ).filter((userId) => userSummaries[userId] == null);

      if (userIds.length === 0) {
        return;
      }

      const profiles = await Promise.all(
        userIds.map(async (userId) => {
          try {
            const profile = await fetchUserProfileById(userId);

            return {
              userId,
              summary: {
                name: profile.name || `참여자 ${userId}`,
                phoneSuffix:
                  getPhoneSuffix(profile.phone) ||
                  profile.maskedId ||
                  String(userId).padStart(4, '0').slice(-4),
              },
            };
          } catch {
            return null;
          }
        }),
      );

      if (!isMounted) {
        return;
      }

      const nextSummaries = profiles.reduce<Record<number, DutchPayUserSummary>>(
        (acc, item) => {
          if (item) {
            acc[item.userId] = item.summary;
          }

          return acc;
        },
        {},
      );

      if (Object.keys(nextSummaries).length > 0) {
        setUserSummaries((prev) => ({
          ...prev,
          ...nextSummaries,
        }));
      }
    };

    void loadParticipantUserSummaries();

    return () => {
      isMounted = false;
    };
  }, [isServerMode, serverSession, userSummaries]);

  useEffect(() => {
    if (sessionId == null) {
      return;
    }

    let isMounted = true;

    const syncSession = async () => {
      try {
        setIsSyncing(true);
        setServerErrorMessage('');

        const nextSession = await getDutchPaySession(sessionId, currentUserId);

        if (isMounted) {
          setServerSession(nextSession);
        }
      } catch (error) {
        if (isMounted) {
          setServerErrorMessage(
            error instanceof Error
              ? error.message
              : '더치페이 세션 정보를 불러오지 못했습니다.',
          );
          Alert.alert(
            '더치페이',
            error instanceof Error
              ? error.message
              : '더치페이 세션 정보를 불러오지 못했습니다.',
          );
        }
      } finally {
        if (isMounted) {
          setIsSyncing(false);
        }
      }
    };

    void syncSession();

    return () => {
      isMounted = false;
    };
  }, [currentUserId, sessionId]);

  useEffect(() => {
    if (!forcedScenario || !serverSession) {
      return;
    }

    const serverScenario = toDutchPayScenario(
      serverSession,
      role,
      currentUserId,
      splitType,
    );

    if (serverScenario !== 'OWNER_AMOUNT_INPUT_COMPLETE') {
      setForcedScenario(null);
    }
  }, [currentUserId, forcedScenario, role, serverSession, splitType]);

  useFocusEffect(
    useCallback(() => {
      setIsLeavingForPayment(false);

      if (isServerMode && sessionId != null) {
        void refreshServerSession();
      }
    }, [isServerMode, refreshServerSession, sessionId]),
  );

  useEffect(() => {
    if (!isServerMode || sessionId == null || isLeavingForPayment) {
      return;
    }

    const shouldPollSession =
      data.scenario === 'OWNER_INITIAL' ||
      data.scenario === 'PARTICIPANT_INITIAL' ||
      data.scenario === 'OWNER_AMOUNT_INPUT_WAITING' ||
      data.scenario === 'OWNER_AMOUNT_INPUT_COMPLETE' ||
      data.scenario === 'OWNER_PAYMENT_REQUEST' ||
      data.scenario === 'OWNER_PAYMENT_PROGRESS' ||
      data.scenario === 'OWNER_FINAL_PAYMENT_READY' ||
      data.scenario === 'OWNER_FINAL_PAYMENT_FAILURE' ||
      (data.scenario === 'PARTICIPANT_AMOUNT_INPUT' && isMyAmountConfirmed) ||
      data.scenario === 'PARTICIPANT_AMOUNT_REVIEW' ||
      data.scenario === 'PARTICIPANT_PAYMENT_REQUEST' ||
      data.scenario === 'PARTICIPANT_PAYMENT_PROGRESS' ||
      data.scenario === 'PARTICIPANT_FINAL_PAYMENT_PROGRESS';

    if (!shouldPollSession) {
      return;
    }

    const intervalId = setInterval(() => {
      if (isPollingSessionRef.current) {
        return;
      }

      isPollingSessionRef.current = true;
      void refreshServerSession().finally(() => {
        isPollingSessionRef.current = false;
      });
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [
    data.scenario,
    isLeavingForPayment,
    isMyAmountConfirmed,
    isServerMode,
    refreshServerSession,
    sessionId,
  ]);

  useEffect(() => {
    if (isAutoSplitParticipantInput) {
      if (data.members.length === 0) {
        setMembers([]);
        setOpenMenuMemberId(null);
        return;
      }

      const splitAmount = Math.floor(data.totalAmount / data.members.length);

      setMembers(
        data.members.map((member) =>
          member.isMe
            ? {
                ...member,
                amount: splitAmount,
                status: 'AMOUNT_CONFIRMED',
                editableAmount: undefined,
              }
            : member,
        ),
      );
      setOpenMenuMemberId(null);
      return;
    }

    if (isParticipantAmountInputScenario) {
      setMembers(
        data.members.map((member) =>
          member.isMe && member.status === 'WAITING_AMOUNT'
            ? {
                ...member,
                status: 'INPUT_EDITING',
                editableAmount: member.amount
                  ? formatEditableAmount(String(member.amount))
                  : '',
              }
            : member,
        ),
      );
      setOpenMenuMemberId(null);
      return;
    }

    setMembers(data.members);
    setOpenMenuMemberId(null);
  }, [
    data.members,
    data.scenario,
    data.totalAmount,
    isAutoSplitParticipantInput,
    role,
  ]);

  useEffect(() => {
    if (
      data.scenario !== 'PARTICIPANT_PAYMENT_REQUEST' &&
      data.scenario !== 'PARTICIPANT_PAYMENT_PROGRESS'
    ) {
      setToastVisible(false);
    }
  }, [data.scenario]);

  useEffect(() => {
    if (
      role === 'PARTICIPANT' &&
      isPaymentRequestSent &&
      !previousPaymentRequestSentRef.current
    ) {
      setToastVisible(true);
    }

    previousPaymentRequestSentRef.current = isPaymentRequestSent;
  }, [isPaymentRequestSent, role]);

  useEffect(() => {
    if (
      !isServerMode ||
      role !== 'PARTICIPANT' ||
      !isMyParticipantPaymentCompleted ||
      participantPaymentCompleteModalShownRef.current
    ) {
      return;
    }

    participantPaymentCompleteModalShownRef.current = true;
    setPaymentCompleteModalVisible(true);
  }, [isMyParticipantPaymentCompleted, isServerMode, role]);

  useEffect(() => {
    if (
      !isServerMode ||
      !serverSession ||
      serverSession.status !== 'CANCELED' ||
      sessionClosedModalShownRef.current
    ) {
      return;
    }

    sessionClosedModalShownRef.current = true;
    Alert.alert('더치페이', '더치페이 그룹이 취소되었습니다.', [
      {
        text: '확인',
        onPress: () => navigation.navigate('Main', { userId: currentUserId }),
      },
    ]);
  }, [currentUserId, isServerMode, navigation, serverSession]);

  useEffect(() => {
    if (
      !isServerMode ||
      !serverSession ||
      timeoutModalShownRef.current ||
      !isDutchPayTimedOut(serverSession)
    ) {
      return;
    }

    timeoutModalShownRef.current = true;
    setTimeoutModalVisible(true);
  }, [isServerMode, serverSession]);

  const handlePressClose = () => {
    setStopModalVisible(true);
  };

  const handleConfirmStopPayment = () => {
    setStopModalVisible(false);

    navigation.navigate('Main', { userId: currentUserId });
  };

  const handleConfirmPaymentComplete = () => {
    setPaymentCompleteModalVisible(false);
    navigation.navigate('Main', { userId: currentUserId });
  };

  const handleConfirmTimeout = () => {
    setTimeoutModalVisible(false);
    navigation.navigate('Main', { userId: currentUserId });
  };

  const handlePressPrimary = () => {
    if (data.footer.type !== 'button') {
      return;
    }

    if (sessionId != null && serverSession) {
      const runServerAction = async () => {
        try {
          setIsSyncing(true);

          if (
            data.scenario === 'OWNER_INITIAL' ||
            data.scenario === 'OWNER_AUTO_SPLIT_READY'
          ) {
            const nextSession = await confirmDutchPayParticipants({
              sessionId,
              splitMethod: resolvedSplitMethod,
              userId: currentUserId,
            });
            setServerSession(nextSession);
            return;
          }

          if (data.scenario === 'PARTICIPANT_INITIAL') {
            setLeaveGroupModalVisible(true);
            return;
          }

          if (data.scenario === 'OWNER_AMOUNT_INPUT_WAITING') {
            await refreshServerSession();
            return;
          }

          if (data.scenario === 'OWNER_AMOUNT_INPUT_COMPLETE') {
            await addConfirmedDutchPayAmountSession(sessionId);
            setIsAmountConfirmed(true);
            setForcedScenario('OWNER_PAYMENT_REQUEST');
            return;
          }

          if (data.scenario === 'OWNER_PAYMENT_REQUEST') {
            await addRequestedDutchPaySession(sessionId);
            setIsPaymentRequestSent(true);
            setForcedScenario('OWNER_PAYMENT_PROGRESS');
            return;
          }

          if (isParticipantAmountInputScenario) {
            if (isMyAmountConfirmed) {
              setMembers((prevMembers) =>
                prevMembers.map((member) =>
                  member.isMe
                    ? {
                        ...member,
                        amount: undefined,
                        status: 'INPUT_EDITING',
                        editableAmount: formatEditableAmount(
                          String(member.amount ?? 0),
                        ),
                      }
                    : member,
                ),
              );
              return;
            }

            const nextSession = await updateDutchPayMyAmount({
              sessionId,
              amount: myEditableAmount,
              userId: currentUserId,
            });
            setServerSession(nextSession);
            return;
          }

          if (data.scenario === 'PARTICIPANT_PAYMENT_REQUEST') {
            setIsLeavingForPayment(true);
            navigation.navigate('PaymentCardSelect', {
              paymentId: myParticipantPaymentId,
              amount: myPaymentAmount,
              flow: 'DUTCH_PAY_MEMBER',
              dutchSessionId: sessionId,
              orderName: serverSession.order_name,
              merchantId: serverSession.merchant_id ?? merchantId,
            });
            return;
          }

          if (
            data.scenario === 'PARTICIPANT_PAYMENT_PROGRESS' &&
            data.footer.type === 'button'
          ) {
            setIsLeavingForPayment(true);
            navigation.navigate('PaymentCardSelect', {
              paymentId: myParticipantPaymentId,
              amount: myPaymentAmount,
              flow: 'DUTCH_PAY_MEMBER',
              dutchSessionId: sessionId,
              orderName: serverSession.order_name,
              merchantId: serverSession.merchant_id ?? merchantId,
            });
            return;
          }

          if (
            data.scenario === 'OWNER_FINAL_PAYMENT_READY' ||
            data.scenario === 'OWNER_FINAL_PAYMENT_FAILURE'
          ) {
            setIsLeavingForPayment(true);
            navigation.navigate('PaymentCardSelect', {
              amount: ownerDisplayAmount,
              flow: 'DUTCH_PAY_FINAL',
              dutchSessionId: sessionId,
              orderName: serverSession.order_name,
              merchantId: serverSession.merchant_id ?? merchantId,
            });
            return;
          }

          await refreshServerSession();
        } catch (error) {
          Alert.alert(
            '더치페이',
            error instanceof Error
              ? error.message
              : '더치페이 요청을 처리하지 못했습니다.',
          );
        } finally {
          setIsSyncing(false);
        }
      };

      void runServerAction();
      return;
    }

    if (data.scenario === 'PARTICIPANT_INITIAL') {
      setLeaveGroupModalVisible(true);
      return;
    }

    if (isParticipantAmountInputScenario) {
      setMembers((prevMembers) =>
        prevMembers.map((member) => {
          if (!member.isMe) {
            return member;
          }

          if (member.status === 'AMOUNT_CONFIRMED') {
            return {
              ...member,
              amount: undefined,
              status: 'INPUT_EDITING',
              editableAmount: formatEditableAmount(String(member.amount ?? 0)),
            };
          }

          return {
            ...member,
            amount: myEditableAmount,
            status: 'AMOUNT_CONFIRMED',
            editableAmount: undefined,
          };
        }),
      );
      return;
    }

    if (
      data.scenario === 'OWNER_FINAL_PAYMENT_READY' ||
      data.scenario === 'OWNER_FINAL_PAYMENT_FAILURE'
    ) {
      navigateToDutchPayMethodSelect(ownerDisplayAmount);
      return;
    }

    const nextScenario = nextScenarioByScenario[data.scenario];

    if (data.scenario === 'OWNER_INITIAL') {
      navigation.replace('DutchPayGroup', {
        role: data.role,
        scenario:
          splitType === 'AUTO_SPLIT'
            ? 'OWNER_AUTO_SPLIT_READY'
            : 'OWNER_AMOUNT_INPUT_WAITING',
        splitType,
      });
      return;
    }

    if (data.scenario === nextScenario) {
      Alert.alert('더치페이', `${data.footer.label} 화면으로 이동합니다.`);
      return;
    }

    navigation.replace('DutchPayGroup', {
      role: data.role,
      scenario: nextScenario,
      splitType,
    });
  };

  const handlePressSecondary = () => {
    if (role === 'PARTICIPANT') {
      setLeaveGroupModalVisible(true);
      return;
    }

    setCancelGroupModalVisible(true);
  };

  const handlePressRemoveMember = (memberId: string) => {
    setOpenMenuMemberId(null);

    const removeMember = async () => {
      if (sessionId == null || !serverSession) {
        setMembers((prevMembers) =>
          prevMembers.filter((member) => member.id !== memberId),
        );
        return;
      }

      const participant = serverSession.participants.find(
        (item) => String(item.participant_id) === memberId,
      );

      if (!participant) {
        Alert.alert('더치페이', '내보낼 참여자 정보를 찾지 못했습니다.');
        return;
      }

      try {
        setIsSyncing(true);
        const nextSession = await removeDutchPayParticipant({
          sessionId,
          participantUserId: participant.user_id,
          userId: currentUserId,
        });
        setServerSession(nextSession);
      } catch (error) {
        Alert.alert(
          '더치페이',
          error instanceof Error
            ? error.message
            : '참여자 내보내기를 처리하지 못했습니다.',
        );
      } finally {
        setIsSyncing(false);
      }
    };

    void removeMember();
  };

  const handleConfirmCancelGroup = async () => {
    setCancelGroupModalVisible(false);

    if (isServerMode) {
      if (sessionId == null) {
        Alert.alert('더치페이', '더치페이 세션 정보가 없습니다.');
        return;
      }

      try {
        setIsSyncing(true);
        await cancelDutchPaySession(sessionId, currentUserId);
        navigation.navigate('Main', { userId: currentUserId });
      } catch (error) {
        Alert.alert(
          '더치페이',
          error instanceof Error
            ? error.message
            : '더치페이 그룹 취소를 처리하지 못했습니다.',
        );
      } finally {
        setIsSyncing(false);
      }
      return;
    }

    navigation.navigate('Main', { userId: currentUserId });
  };

  const handleConfirmLeaveGroup = async () => {
    setLeaveGroupModalVisible(false);

    if (sessionId == null) {
      navigation.navigate('Main', { userId: currentUserId });
      return;
    }

    try {
      setIsSyncing(true);
      await rejectDutchPayInvite(sessionId, currentUserId);
      navigation.navigate('Main', { userId: currentUserId });
    } catch (error) {
      Alert.alert(
        '더치페이',
        error instanceof Error
          ? error.message
          : '더치페이 그룹 나가기를 처리하지 못했습니다.',
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const handleChangeEditableAmount = (memberId: string, value: string) => {
    setMembers((prevMembers) =>
      prevMembers.map((member) =>
        member.id === memberId
          ? {
              ...member,
              editableAmount: formatEditableAmount(value),
            }
          : member,
      ),
    );
  };

  if (isServerMode && !serverSession) {
    return (
      <PageWrap
        scroll={false}
        padded={false}
        backgroundClassName="bg-neutral-white"
        header={
          <Header
            title={getHeaderTitle(data.scenario)}
            type="close"
            onPressRight={handlePressClose}
          />
        }
      >
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-center font-pretendard text-large-bold text-neutral-black1">
            {isSyncing
              ? '더치페이 정보를 확인 중입니다.'
              : '더치페이 정보를 불러오지 못했습니다.'}
          </Text>

          {serverErrorMessage ? (
            <Text className="mt-3 text-center font-pretendard text-normal-regular text-neutral-black2">
              {serverErrorMessage}
            </Text>
          ) : null}
        </View>

        <PaymentStopConfirmModal
          visible={stopModalVisible}
          description="중지하셔도 메인에서 결제 진행상태를 확인할 수 있습니다."
          onConfirm={handleConfirmStopPayment}
          onCancel={() => setStopModalVisible(false)}
        />
      </PageWrap>
    );
  }

  return (
    <PageWrap
      padded={false}
      backgroundClassName="bg-neutral-white"
      scrollContentClassName="px-4 pt-6"
      header={
        <Header
          title={getHeaderTitle(data.scenario)}
          type="close"
          onPressRight={handlePressClose}
        />
      }
      footer={
          <View className="w-full max-w-sm self-center">
            {data.footer.type === 'button' ? (
              <>
                <Button
                  label={primaryLabel}
                  size="large"
                  disabled={primaryDisabled}
                  onPress={handlePressPrimary}
                />
                {shouldShowSecondaryAction ? (
                  <Pressable
                    accessibilityRole="button"
                    className="mt-4 items-center justify-center py-2"
                    onPress={handlePressSecondary}
                  >
                    <Text className="font-pretendard text-normal-regular text-neutral-black2 underline">
                      {data.footer.secondaryLabel}
                    </Text>
                  </Pressable>
                ) : null}
              </>
            ) : (
              <NoticeBox tone={data.footer.tone} description={data.footer.message} />
            )}
          </View>
      }
      overlay={
        <>
        <Toast
          visible={toastVisible}
          type="info"
          message={'대표자가 결제를 요청했습니다.\n결제는 10분 이내 진행해주세요.'}
        />
        <PaymentStopConfirmModal
          visible={stopModalVisible}
          description="중지하셔도 메인에서 결제 진행상태를 확인할 수 있습니다."
          onConfirm={handleConfirmStopPayment}
          onCancel={() => setStopModalVisible(false)}
        />
        <Modal
          visible={cancelGroupModalVisible}
          type="two"
          title="정말 해당 그룹을 취소하시겠습니까?"
          description="취소하면 참여자는 더 이상 이 그룹에 참여할 수 없습니다."
          confirmLabel="예"
          cancelLabel="아니오"
          onConfirm={handleConfirmCancelGroup}
          onCancel={() => setCancelGroupModalVisible(false)}
          onClose={() => setCancelGroupModalVisible(false)}
        />
        <Modal
          visible={leaveGroupModalVisible}
          type="two"
          title="더치페이 그룹을 나가시겠습니까?"
          description="나가면 해당 더치페이 그룹에 다시 참여해야 결제를 진행할 수 있습니다."
          confirmLabel="예"
          cancelLabel="아니오"
          onConfirm={handleConfirmLeaveGroup}
          onCancel={() => setLeaveGroupModalVisible(false)}
          onClose={() => setLeaveGroupModalVisible(false)}
        />
        <Modal
          visible={paymentCompleteModalVisible}
          type="one"
          title="결제가 완료되었습니다."
          description="대표자의 최종 결제 진행 상황은 메인에서 확인할 수 있습니다."
          confirmLabel="확인"
          onConfirm={handleConfirmPaymentComplete}
          onClose={handleConfirmPaymentComplete}
        />
        <Modal
          visible={timeoutModalVisible}
          type="one"
          title="결제 요청 시간이 지났습니다."
          confirmLabel="확인"
          onConfirm={handleConfirmTimeout}
          onClose={handleConfirmTimeout}
        />
        </>
      }
    >
      <View className="w-full max-w-sm self-center">
        {!isServerMode ? (
          <View className="mb-3">
            <PaymentMockBadge />
          </View>
        ) : null}
        <DutchPayTotalNotice amount={data.totalAmount} />

        <View>
          {displayMembers.map((member, index) => (
            <DutchPayMemberRow
              key={`${data.scenario}-${member.id}`}
              member={member}
              isLast={index === displayMembers.length - 1}
              menuOpen={openMenuMemberId === member.id}
              onPressMenu={(memberId) =>
                setOpenMenuMemberId((prev) =>
                  prev === memberId ? null : memberId,
                )
              }
              onPressRemoveMember={handlePressRemoveMember}
              onChangeEditableAmount={handleChangeEditableAmount}
            />
          ))}
        </View>

        {(isOwnerAmountCheckScenario || isOwnerFinalPaymentScenario) &&
        isParticipantAmountOverLimit ? (
          <View className="mt-7">
            <NoticeBox
              tone="error"
              description="참여자 금액 합계가 총 결제금액을 초과했습니다."
            />
          </View>
        ) : null}

        {data.contentNotice ? (
          <View className="mt-7">
            <NoticeBox
              tone={data.contentNotice.tone}
              description={data.contentNotice.message}
            />
          </View>
        ) : null}

        {isOwnerFinalPaymentScenario && failedPaymentMembers.length > 0 ? (
          <View className="mt-7 gap-3">
            {failedPaymentMembers.map((member) => (
              <NoticeBox
                key={`failed-payment-notice-${member.id}`}
                tone="error"
                description={`${member.name}(${member.phoneSuffix})님의 결제가 실패하여,\n대표자 결제 금액이 변경되었습니다.`}
              />
            ))}
          </View>
        ) : null}
      </View>
    </PageWrap>
  );
}
