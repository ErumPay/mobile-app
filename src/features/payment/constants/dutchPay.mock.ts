import type {
  DutchPayGroupData,
  DutchPayMember,
  DutchPayRole,
  DutchPayScenario,
} from '../types/dutchPay.types';

const totalAmount = 90000;

const baseMembers: DutchPayMember[] = [
  {
    id: 'owner',
    name: '김지지',
    phoneSuffix: '1111',
    initial: '김',
    isOwner: true,
    status: 'EMPTY',
  },
  {
    id: 'member-a',
    name: '김지지',
    phoneSuffix: '1234',
    initial: '김',
    status: 'EMPTY',
  },
  {
    id: 'member-b',
    name: '박지지',
    phoneSuffix: '1441',
    initial: '박',
    status: 'EMPTY',
  },
];

function withMembers(updates: Partial<DutchPayMember>[]): DutchPayMember[] {
  return baseMembers.map((member, index) => ({
    ...member,
    ...updates[index],
  }));
}

const scenarioData: Record<
  DutchPayScenario,
  Omit<DutchPayGroupData, 'role' | 'scenario'>
> = {
  OWNER_INITIAL: {
    totalAmount,
    members: withMembers([{ canOpenMenu: false }]).filter(
      (member) => member.isOwner,
    ),
    footer: {
      type: 'button',
      label: '더치페이 그룹 확정하기',
      secondaryLabel: '더치페이 그룹 취소하기',
    },
  },
  OWNER_AUTO_SPLIT_READY: {
    totalAmount,
    members: withMembers([
      { amount: 30000, status: 'AUTO_SPLIT' },
      { amount: 30000, status: 'AUTO_SPLIT' },
      { amount: 30000, status: 'AUTO_SPLIT' },
    ]),
    footer: {
      type: 'button',
      label: '더치페이 금액 확정하기',
    },
  },
  OWNER_AMOUNT_INPUT_WAITING: {
    totalAmount,
    members: withMembers([
      { amount: totalAmount, status: 'AMOUNT_CONFIRMED' },
      { status: 'WAITING_AMOUNT' },
      { status: 'WAITING_AMOUNT' },
    ]),
    footer: {
      type: 'button',
      label: '더치페이 금액 확정하기',
      disabled: true,
    },
  },
  OWNER_AMOUNT_INPUT_COMPLETE: {
    totalAmount,
    members: withMembers([
      { amount: 40000, status: 'AMOUNT_CONFIRMED' },
      { amount: 30000, status: 'AMOUNT_CONFIRMED' },
      { amount: 10000, status: 'AMOUNT_CONFIRMED' },
    ]),
    footer: {
      type: 'button',
      label: '더치페이 금액 확정하기',
    },
  },
  OWNER_PAYMENT_REQUEST: {
    totalAmount,
    members: withMembers([
      { amount: 40000, status: 'AMOUNT_CONFIRMED' },
      { amount: 30000, status: 'AMOUNT_CONFIRMED' },
      { amount: 10000, status: 'AMOUNT_CONFIRMED' },
    ]),
    footer: {
      type: 'button',
      label: '참여자에게 결제 요청하기',
    },
  },
  OWNER_PAYMENT_PROGRESS: {
    totalAmount,
    members: withMembers([
      { amount: 40000, status: 'AMOUNT_CONFIRMED' },
      { status: 'PAYMENT_PENDING' },
      { status: 'PAYMENT_PENDING' },
    ]),
    footer: {
      type: 'button',
      label: '최종 결제하기',
      disabled: true,
    },
  },
  OWNER_FINAL_PAYMENT_READY: {
    totalAmount,
    members: withMembers([
      { amount: 40000, status: 'AMOUNT_CONFIRMED' },
      { status: 'PAYMENT_COMPLETED' },
      { status: 'PAYMENT_COMPLETED' },
    ]),
    footer: {
      type: 'button',
      label: '최종 결제하기',
    },
  },
  OWNER_FINAL_PAYMENT_FAILURE: {
    totalAmount,
    members: withMembers([
      { amount: 40000, status: 'AMOUNT_CONFIRMED' },
      { amount: 30000, status: 'PAYMENT_FAILED' },
      { amount: 10000, status: 'PAYMENT_COMPLETED' },
    ]),
    contentNotice: {
      tone: 'error',
      message: '김지지(1234)님의 결제가 실패하여,\n대표자 결제 금액이 변경되었습니다.',
    },
    footer: {
      type: 'button',
      label: '최종 결제하기',
    },
  },
  PARTICIPANT_INITIAL: {
    totalAmount,
    members: withMembers([{}, { isMe: true }, {}]),
    footer: {
      type: 'button',
      label: '더치페이 그룹 나가기',
    },
  },
  PARTICIPANT_AMOUNT_INPUT: {
    totalAmount,
    members: withMembers([
      { amount: totalAmount, status: 'AMOUNT_CONFIRMED' },
      { isMe: true, status: 'INPUT_EDITING', editableAmount: '0' },
      { status: 'WAITING_AMOUNT' },
    ]),
    footer: {
      type: 'button',
      label: '금액 확정하기',
    },
  },
  PARTICIPANT_AMOUNT_REVIEW: {
    totalAmount,
    members: withMembers([
      { amount: 40000, status: 'AMOUNT_CONFIRMED' },
      { isMe: true, amount: 40000, status: 'AMOUNT_REVIEW' },
      { amount: 10000, status: 'AMOUNT_CONFIRMED' },
    ]),
    footer: {
      type: 'notice',
      tone: 'info',
      message: '대표자가 결제 금액 확인을 하고 있습니다.',
    },
  },
  PARTICIPANT_PAYMENT_PROGRESS: {
    totalAmount,
    members: withMembers([
      { amount: 40000, status: 'AMOUNT_CONFIRMED' },
      { isMe: true, status: 'PAYMENT_COMPLETED' },
      { status: 'PAYMENT_FAILED' },
    ]),
    footer: {
      type: 'notice',
      tone: 'info',
      message: '그룹원들이 결제를 진행하고 있습니다.',
    },
  },
  PARTICIPANT_PAYMENT_REQUEST: {
    totalAmount,
    members: withMembers([
      { amount: 40000, status: 'AMOUNT_CONFIRMED' },
      { isMe: true, amount: 30000, status: 'AMOUNT_CONFIRMED' },
      { amount: 10000, status: 'AMOUNT_CONFIRMED' },
    ]),
    footer: {
      type: 'button',
      label: '결제 진행하기',
    },
  },
  PARTICIPANT_FINAL_PAYMENT_PROGRESS: {
    totalAmount,
    members: withMembers([
      { amount: 40000, status: 'AMOUNT_CONFIRMED' },
      { isMe: true, status: 'PAYMENT_COMPLETED' },
      { status: 'PAYMENT_PENDING' },
    ]),
    footer: {
      type: 'notice',
      tone: 'info',
      message: '대표자가 결제를 진행하고 있습니다.',
    },
  },
};

export function getMockDutchPayGroupData({
  role = 'OWNER',
  scenario,
}: {
  role?: DutchPayRole;
  scenario?: DutchPayScenario;
}): DutchPayGroupData {
  const resolvedScenario =
    scenario ?? (role === 'OWNER' ? 'OWNER_INITIAL' : 'PARTICIPANT_INITIAL');

  return {
    role,
    scenario: resolvedScenario,
    ...scenarioData[resolvedScenario],
  };
}
