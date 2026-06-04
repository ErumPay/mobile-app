import type {
  ParticipantFriend,
  ParticipantSelectMode,
  ParticipantSelectScenario,
} from '../types/paymentParticipantSelect.types';

export const mockParticipantOwner: ParticipantFriend = {
  id: 'owner',
  name: '홍길동',
  phoneNumber: '010-1234-5678',
  phoneSuffix: '5678',
  initial: '홍',
  colorClassName: 'bg-erum-main',
};

export const mockFavoriteFriends: ParticipantFriend[] = [
  {
    id: 'friend-1',
    name: '김민수',
    phoneNumber: '010-1111-1111',
    phoneSuffix: '1111',
    initial: '김',
    colorClassName: 'bg-[#9B42F5]',
    favorite: true,
  },
  {
    id: 'friend-2',
    name: '이지현',
    phoneNumber: '010-2222-2222',
    phoneSuffix: '2222',
    initial: '이',
    colorClassName: 'bg-[#E92A8A]',
    favorite: true,
  },
  {
    id: 'friend-3',
    name: '박서준',
    phoneNumber: '010-3333-3333',
    phoneSuffix: '3333',
    initial: '박',
    colorClassName: 'bg-[#10C85A]',
    favorite: true,
  },
];

export const mockAllFriends: ParticipantFriend[] = [
  {
    id: 'friend-4',
    name: '최유진',
    phoneNumber: '010-4444-4444',
    phoneSuffix: '4444',
    initial: '최',
    colorClassName: 'bg-[#F2B705]',
  },
  {
    id: 'friend-5',
    name: '정다은',
    phoneNumber: '010-5555-5555',
    phoneSuffix: '5555',
    initial: '정',
    colorClassName: 'bg-[#EF2F35]',
  },
  {
    id: 'friend-6',
    name: '강호준',
    phoneNumber: '010-6666-6666',
    phoneSuffix: '6666',
    initial: '강',
    colorClassName: 'bg-[#655CFF]',
  },
  {
    id: 'friend-7',
    name: '윤서아',
    phoneNumber: '010-7777-7777',
    phoneSuffix: '7777',
    initial: '윤',
    colorClassName: 'bg-[#0EC4B7]',
  },
  {
    id: 'friend-8',
    name: '한지우',
    phoneNumber: '010-8888-8888',
    phoneSuffix: '8888',
    initial: '한',
    colorClassName: 'bg-[#2E7CF6]',
  },
  {
    id: 'friend-9',
    name: '송민재',
    phoneNumber: '010-9999-9999',
    phoneSuffix: '9999',
    initial: '송',
    colorClassName: 'bg-[#B244F6]',
  },
  {
    id: 'friend-10',
    name: '임수빈',
    phoneNumber: '010-1010-1010',
    phoneSuffix: '1010',
    initial: '임',
    colorClassName: 'bg-[#EA2A9B]',
  },
];

export function getParticipantSelectMockState({
  mode,
  scenario,
}: {
  mode: ParticipantSelectMode;
  scenario: ParticipantSelectScenario;
}) {
  const isDutchPay = mode === 'DUTCH_PAY';
  const selectedFriendIds =
    scenario === 'SELECTED' ? [mockFavoriteFriends[0].id] : [];

  return {
    owner: mockParticipantOwner,
    favoriteFriends:
      scenario === 'NO_FRIENDS'
        ? []
        : mockFavoriteFriends,
    allFriends:
      scenario === 'NO_FRIENDS'
        ? []
        : mockAllFriends,
    selectedFriendIds,
    autoSplitChecked: isDutchPay && scenario === 'SELECTED',
    searchKeyword: scenario === 'NO_SEARCH_RESULT' ? 'ㅇㅇㅇㅇ' : '',
    shareModalVisible: scenario === 'SHARE_LINK',
  };
}
