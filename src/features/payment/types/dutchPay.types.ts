export type DutchPayRole = 'OWNER' | 'PARTICIPANT';

export type DutchPayMemberStatus =
  | 'EMPTY'
  | 'AUTO_SPLIT'
  | 'AMOUNT_CONFIRMED'
  | 'WAITING_AMOUNT'
  | 'INPUT_EDITING'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_COMPLETED'
  | 'PAYMENT_FAILED';

export type DutchPayScenario =
  | 'OWNER_INITIAL'
  | 'OWNER_AUTO_SPLIT_READY'
  | 'OWNER_AMOUNT_INPUT_WAITING'
  | 'OWNER_AMOUNT_INPUT_COMPLETE'
  | 'OWNER_PAYMENT_REQUEST'
  | 'OWNER_PAYMENT_PROGRESS'
  | 'OWNER_FINAL_PAYMENT_READY'
  | 'OWNER_FINAL_PAYMENT_FAILURE'
  | 'PARTICIPANT_INITIAL'
  | 'PARTICIPANT_AMOUNT_INPUT'
  | 'PARTICIPANT_PAYMENT_PROGRESS'
  | 'PARTICIPANT_PAYMENT_REQUEST'
  | 'PARTICIPANT_FINAL_PAYMENT_PROGRESS';

export type DutchPayGroupRouteParams = {
  role?: DutchPayRole;
  scenario?: DutchPayScenario;
  splitType?: 'AUTO_SPLIT' | 'MANUAL';
  sessionId?: number | string;
  userId?: number | string;
  selectedUserIds?: number[];
  splitMethod?: 'EQUAL' | 'CUSTOM';
  orderName?: string;
  merchantId?: number | string;
};

export type DutchPayMember = {
  id: string;
  name: string;
  phoneSuffix: string;
  initial: string;
  isOwner?: boolean;
  isMe?: boolean;
  amount?: number;
  status: DutchPayMemberStatus;
  editableAmount?: string;
  canOpenMenu?: boolean;
};

export type DutchPayGroupData = {
  role: DutchPayRole;
  scenario: DutchPayScenario;
  totalAmount: number;
  members: DutchPayMember[];
  contentNotice?: {
    tone: 'info' | 'warning' | 'error';
    message: string;
  };
  footer:
    | {
        type: 'button';
        label: string;
        disabled?: boolean;
        secondaryLabel?: string;
      }
    | {
        type: 'notice';
        tone: 'info' | 'warning' | 'error';
        message: string;
      };
};
