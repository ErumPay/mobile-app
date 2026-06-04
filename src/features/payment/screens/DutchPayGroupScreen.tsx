import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import type { RootStackParamList } from '../../../../App';
import Button from '../../../shared/components/Button';
import Modal from '../../../shared/components/Modal';
import NoticeBox from '../../../shared/components/NoticeBox';
import PageWrap from '../../../shared/components/PageWrap';
import { Toast } from '../../../shared/components/Toast';
import { colors } from '../../../shared/styles/designTokens';
import DutchPayMemberRow from '../components/DutchPayMemberRow';
import DutchPayTotalNotice from '../components/DutchPayTotalNotice';
import PaymentMockBadge from '../components/PaymentMockBadge';
import PaymentStopConfirmModal from '../components/PaymentStopConfirmModal';
import { getMockDutchPayGroupData } from '../constants/dutchPay.mock';
import type { PaymentRequestSummary } from '../types/paymentMethod.types';
import type {
  DutchPayGroupData,
  DutchPayMember,
  DutchPayScenario,
} from '../types/dutchPay.types';
import {
  confirmDutchPayParticipants,
  getDutchPaySession,
  inviteDutchPayAppFriends,
  updateDutchPayMyAmount,
  DUTCH_PAY_DEV_USER_ID,
  type DutchPayParticipantResponse,
  type DutchPaySessionDetailResponse,
} from '../api/dutchPayApi';

type Props = NativeStackScreenProps<RootStackParamList, 'DutchPayGroup'>;

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
  PARTICIPANT_AMOUNT_INPUT: 'PARTICIPANT_PAYMENT_REQUEST',
  PARTICIPANT_PAYMENT_PROGRESS: 'PARTICIPANT_FINAL_PAYMENT_PROGRESS',
  PARTICIPANT_PAYMENT_REQUEST: 'PARTICIPANT_PAYMENT_PROGRESS',
  PARTICIPANT_FINAL_PAYMENT_PROGRESS: 'PARTICIPANT_FINAL_PAYMENT_PROGRESS',
} as const;

function DutchPayHeader({
  title,
  onPressClose,
}: {
  title: string;
  onPressClose: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between border-b border-neutral-grey1 bg-neutral-white px-4 py-3">
      <Text className="min-w-0 flex-1 font-pretendard text-heading-3 text-neutral-black1">
        {title}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="닫기"
        className="ml-3 h-10 w-10 items-center justify-center"
        onPress={onPressClose}
      >
        <Feather name="x" size={26} color={colors.neutral.black1} />
      </Pressable>
    </View>
  );
}

function getHeaderTitle(scenario: DutchPayScenario) {
  if (
    scenario === 'OWNER_PAYMENT_REQUEST' ||
    scenario === 'PARTICIPANT_PAYMENT_REQUEST'
  ) {
    return '더치페이 결제 금액 확인중';
  }

  if (
    scenario === 'OWNER_FINAL_PAYMENT_READY' ||
    scenario === 'OWNER_PAYMENT_PROGRESS' ||
    scenario === 'OWNER_FINAL_PAYMENT_FAILURE' ||
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

function parseAmount(value?: string) {
  return Number((value ?? '').replace(/[^0-9]/g, '')) || 0;
}

function formatEditableAmount(value: string) {
  return parseAmount(value).toLocaleString('ko-KR');
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
): DutchPayScenario {
  if (role === 'PARTICIPANT') {
    switch (session.session_progress_step) {
      case 'AMOUNT_INPUT':
        return 'PARTICIPANT_AMOUNT_INPUT';
      case 'PAYMENT_REQUEST':
        return 'PARTICIPANT_PAYMENT_REQUEST';
      case 'PAYMENT_IN_PROGRESS':
        return 'PARTICIPANT_PAYMENT_PROGRESS';
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

  if (participant.status === 'REJECTED' || participant.status === 'TIMEOUT') {
    return 'PAYMENT_FAILED' as const;
  }

  if (participant.payment_id != null) {
    return 'PAYMENT_PENDING' as const;
  }

  if (participant.amount != null) {
    return 'AMOUNT_CONFIRMED' as const;
  }

  if (participant.status === 'PENDING') {
    return 'WAITING_AMOUNT' as const;
  }

  return 'EMPTY' as const;
}

function toDutchPayMember(
  participant: DutchPayParticipantResponse,
  currentUserId: number,
): DutchPayMember {
  const name = participant.host ? '대표자' : `참여자 ${participant.user_id}`;
  const phoneSuffix = String(participant.user_id).padStart(4, '0').slice(-4);

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
): DutchPayGroupData {
  const scenario = toDutchPayScenario(session, role);
  const members = session.participants.map((participant) =>
    toDutchPayMember(participant, currentUserId),
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
      label: '결제 전체 상태 보기',
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

  if (
    scenario === 'OWNER_AMOUNT_INPUT_WAITING' ||
    scenario === 'OWNER_AMOUNT_INPUT_COMPLETE'
  ) {
    return {
      type: 'button' as const,
      label: '금액 확정하기',
    };
  }

  if (scenario === 'PARTICIPANT_AMOUNT_INPUT') {
    return {
      type: 'button' as const,
      label: '금액 확정하기',
    };
  }

  if (scenario === 'PARTICIPANT_PAYMENT_REQUEST') {
    return {
      type: 'button' as const,
      label: '결제 진행하기',
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
  const sessionId = route.params?.sessionId;
  const isServerMode = typeof sessionId === 'number';
  const currentUserId = DUTCH_PAY_DEV_USER_ID;
  const selectedUserIds = useMemo(
    () => route.params?.selectedUserIds ?? [],
    [route.params?.selectedUserIds],
  );
  const [serverSession, setServerSession] =
    useState<DutchPaySessionDetailResponse | null>(null);
  const [serverErrorMessage, setServerErrorMessage] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const invitedSessionIdsRef = useRef<Set<number>>(new Set());
  const data = useMemo(
    () =>
      serverSession
        ? toDutchPayGroupData(serverSession, role, currentUserId)
        : getMockDutchPayGroupData({ role, scenario }),
    [currentUserId, role, scenario, serverSession],
  );
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [openMenuMemberId, setOpenMenuMemberId] = useState<string | null>(null);
  const [members, setMembers] = useState<DutchPayMember[]>(data.members);
  const [toastVisible, setToastVisible] = useState(false);
  const [stopModalVisible, setStopModalVisible] = useState(false);
  const [cancelGroupModalVisible, setCancelGroupModalVisible] = useState(false);

  const isParticipantAmountInputScenario =
    data.scenario === 'PARTICIPANT_AMOUNT_INPUT';
  const isAutoSplitParticipantInput =
    isParticipantAmountInputScenario && splitType === 'AUTO_SPLIT';
  const participantMembers = members.filter((member) => !member.isOwner);
  const confirmedParticipantAmount = participantMembers.reduce(
    (total, member) =>
      member.status === 'AMOUNT_CONFIRMED' ? total + (member.amount ?? 0) : total,
    0,
  );
  const ownerAmount = Math.max(data.totalAmount - confirmedParticipantAmount, 0);
  const allParticipantsConfirmed =
    participantMembers.length > 0 &&
    participantMembers.every((member) => member.status === 'AMOUNT_CONFIRMED');
  const isOwnerAmountCheckScenario =
    data.scenario === 'OWNER_AMOUNT_INPUT_WAITING' ||
    data.scenario === 'OWNER_AMOUNT_INPUT_COMPLETE';
  const myMember = members.find((member) => member.isMe);
  const myEditableAmount = parseAmount(myMember?.editableAmount);
  const isMyAmountConfirmed =
    myMember?.status === 'AMOUNT_CONFIRMED' && typeof myMember.amount === 'number';
  const displayMembers = applyFailedPaymentAmountToOwner(
    members.map((member) => {
      if (
        member.isOwner &&
        (isOwnerAmountCheckScenario || isParticipantAmountInputScenario)
      ) {
        return {
          ...member,
          amount: ownerAmount,
          status: 'AMOUNT_CONFIRMED',
        };
      }

      return member;
    }),
  );
  const primaryDisabled =
    data.footer.type === 'button' &&
    (isSyncing ||
      (data.footer.disabled && !isOwnerAmountCheckScenario) ||
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
  const ownerDisplayAmount =
    displayMembers.find((member) => member.isOwner)?.amount ?? ownerAmount;
  const myPaymentAmount =
    displayMembers.find((member) => member.isMe)?.amount ?? myEditableAmount;
  const latestPaymentAmountRef = useRef(myPaymentAmount);

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
    if (!sessionId) {
      return;
    }

    const nextSession = await getDutchPaySession(sessionId);
    setServerSession(nextSession);
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    let isMounted = true;

    const syncSession = async () => {
      try {
        setIsSyncing(true);
        setServerErrorMessage('');

        if (
          selectedUserIds.length > 0 &&
          !invitedSessionIdsRef.current.has(sessionId)
        ) {
          const invitedSession = await inviteDutchPayAppFriends({
            sessionId,
            userIds: selectedUserIds,
          });

          invitedSessionIdsRef.current.add(sessionId);

          if (isMounted) {
            setServerSession(invitedSession);
          }

          return;
        }

        const nextSession = await getDutchPaySession(sessionId);

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
  }, [selectedUserIds, sessionId]);

  useEffect(() => {
    latestPaymentAmountRef.current = myPaymentAmount;
  }, [myPaymentAmount]);

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
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }

    if (data.scenario !== 'PARTICIPANT_PAYMENT_REQUEST') {
      setToastVisible(false);
      return;
    }

    setToastVisible(true);
    redirectTimerRef.current = setTimeout(() => {
      setToastVisible(false);
      navigateToDutchPayMethodSelect(latestPaymentAmountRef.current);
      redirectTimerRef.current = null;
    }, 3000);

    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
    };
  }, [data.scenario, navigateToDutchPayMethodSelect]);

  const handlePressClose = () => {
    setStopModalVisible(true);
  };

  const handleConfirmStopPayment = () => {
    setStopModalVisible(false);

    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('Main');
  };

  const handlePressPrimary = () => {
    if (data.footer.type !== 'button') {
      return;
    }

    if (sessionId && serverSession) {
      const runServerAction = async () => {
        try {
          setIsSyncing(true);

          if (
            data.scenario === 'OWNER_INITIAL' ||
            data.scenario === 'OWNER_AUTO_SPLIT_READY' ||
            data.scenario === 'OWNER_AMOUNT_INPUT_COMPLETE'
          ) {
            const nextSession = await confirmDutchPayParticipants({
              sessionId,
              splitMethod: route.params?.splitMethod,
            });
            setServerSession(nextSession);
            return;
          }

          if (isParticipantAmountInputScenario) {
            const nextSession = await updateDutchPayMyAmount({
              sessionId,
              amount: myEditableAmount,
            });
            setServerSession(nextSession);
            return;
          }

          if (data.scenario === 'PARTICIPANT_PAYMENT_REQUEST') {
            navigation.navigate('PaymentCardSelect', {
              amount: myPaymentAmount,
              flow: 'DUTCH_PAY',
              dutchSessionId: sessionId,
              orderName: serverSession.order_name,
              merchantId: serverSession.merchant_id,
            });
            return;
          }

          if (
            data.scenario === 'OWNER_FINAL_PAYMENT_READY' ||
            data.scenario === 'OWNER_FINAL_PAYMENT_FAILURE'
          ) {
            navigation.navigate('PaymentCardSelect', {
              amount: ownerDisplayAmount,
              flow: 'DUTCH_PAY_FINAL',
              dutchSessionId: sessionId,
              orderName: serverSession.order_name,
              merchantId: serverSession.merchant_id,
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
      navigation.navigate('Main');
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
    setCancelGroupModalVisible(true);
  };

  const handlePressRemoveMember = (memberId: string) => {
    setMembers((prevMembers) =>
      prevMembers.filter((member) => member.id !== memberId),
    );
    setOpenMenuMemberId(null);
  };

  const handleConfirmCancelGroup = () => {
    setCancelGroupModalVisible(false);
    navigation.navigate('Main');
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
          <DutchPayHeader
            title={getHeaderTitle(data.scenario)}
            onPressClose={handlePressClose}
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
      scroll={false}
      padded={false}
      backgroundClassName="bg-neutral-white"
      header={
        <DutchPayHeader
          title={getHeaderTitle(data.scenario)}
          onPressClose={handlePressClose}
        />
      }
    >
      <View className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-6 pt-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
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

            {data.contentNotice ? (
              <View className="mt-7">
                <NoticeBox
                  tone={data.contentNotice.tone}
                  description={data.contentNotice.message}
                />
              </View>
            ) : null}
          </View>
        </ScrollView>

        <View className="border-t border-neutral-grey1 bg-neutral-white px-4 pb-5 pt-4">
          <View className="w-full max-w-sm self-center">
            {data.footer.type === 'button' ? (
              <>
                <Button
                  label={primaryLabel}
                  size="large"
                  disabled={primaryDisabled}
                  onPress={handlePressPrimary}
                />
                {data.footer.secondaryLabel ? (
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
        </View>
        <Toast
          visible={toastVisible}
          type="info"
          message={'3초 뒤 결제 화면으로 이동됩니다.\n결제는 10분 이내 진행해주세요.'}
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
      </View>
    </PageWrap>
  );
}
