export type ParticipantSelectMode = 'DUTCH_PAY' | 'REMOTE_PAYMENT';

export type ParticipantSelectScenario =
  | 'DEFAULT'
  | 'SELECTED'
  | 'NO_FRIENDS'
  | 'NO_SEARCH_RESULT'
  | 'SHARE_LINK';

export type ParticipantSelectRouteParams = {
  mode?: ParticipantSelectMode;
  scenario?: ParticipantSelectScenario;
  paymentId?: number;
  amount?: number;
  orderName?: string;
  merchantId?: number;
};

export type ParticipantFriend = {
  id: string;
  name: string;
  phoneNumber: string;
  phoneSuffix: string;
  initial: string;
  colorClassName: string;
  profileImageUrl?: string;
  favorite?: boolean;
};
