import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import type { RootStackParamList } from '../../../../App';
import Button from '../../../shared/components/Button';
import NoticeBox from '../../../shared/components/NoticeBox';
import PageWrap from '../../../shared/components/PageWrap';
import { Toast } from '../../../shared/components/Toast';
import { colors } from '../../../shared/styles/designTokens';
import DutchPayMemberRow from '../components/DutchPayMemberRow';
import DutchPayTotalNotice from '../components/DutchPayTotalNotice';
import { getMockDutchPayGroupData } from '../constants/dutchPay.mock';
import type { PaymentRequestSummary } from '../types/paymentMethod.types';
import type { DutchPayMember, DutchPayScenario } from '../types/dutchPay.types';

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

export default function DutchPayGroupScreen({ navigation, route }: Props) {
  const role = route.params?.role ?? 'OWNER';
  const scenario = route.params?.scenario;
  const splitType = route.params?.splitType ?? 'MANUAL';
  const data = getMockDutchPayGroupData({ role, scenario });
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [openMenuMemberId, setOpenMenuMemberId] = useState<string | null>(null);
  const [members, setMembers] = useState<DutchPayMember[]>(data.members);
  const [toastVisible, setToastVisible] = useState(false);

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
    ((data.footer.disabled && !isOwnerAmountCheckScenario) ||
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

  const navigateToDutchPayMethodSelect = (amount: number) => {
    navigation.navigate('PaymentMethodSelect', {
      summary: createDutchPayPaymentSummary({
        paymentId: role === 'OWNER' ? 1347001 : 1347002,
        amount,
      }),
    });
  };

  useEffect(() => {
    if (isAutoSplitParticipantInput) {
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
  }, [data.scenario, data.totalAmount, isAutoSplitParticipantInput, role]);

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
      navigateToDutchPayMethodSelect(myPaymentAmount);
      redirectTimerRef.current = null;
    }, 3000);

    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
    };
  }, [data.scenario, myPaymentAmount]);

  const handlePressClose = () => {
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
    Alert.alert('더치페이', '더치페이 그룹 취소 요청입니다.');
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
            <DutchPayTotalNotice amount={data.totalAmount} />

            <View className="mt-9 gap-5">
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
      </View>
    </PageWrap>
  );
}
