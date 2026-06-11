import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { RootStackParamList } from '../../../../App';
import Button from '../../../shared/components/Button';
import Checkbox from '../../../shared/components/Checkbox';
import FriendListItem from '../../../shared/components/FriendListItem';
import ConfirmModal from '../../../shared/components/Modal';
import InviteLinkModal from '../../../shared/components/InviteLinkModal';
import NoticeBox from '../../../shared/components/NoticeBox';
import PageWrap from '../../../shared/components/PageWrap';
import { colors } from '../../../shared/styles/designTokens';
import { fetchAuthFriends, type AuthFriendResponse } from '../../friend/api/friendApi';
import { fetchUserProfile } from '../../mypage/api/mypageApi';
import PaymentStopConfirmModal from '../components/PaymentStopConfirmModal';
import { requestRemotePayment } from '../api/remotePaymentApi';
import {
  createDutchPayInviteLink,
  sendDutchPayInviteNotifications,
} from '../api/dutchPayApi';
import { useRemotePaymentProgressStore } from '../stores/useRemotePaymentProgressStore';
import type {
  ParticipantFriend,
  ParticipantSelectMode,
} from '../types/paymentParticipantSelect.types';
import { removeCancelledDutchPaySession } from '../utils/cancelledDutchPaySessions';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'PaymentParticipantSelect'
>;

type ShareStep = 'READY' | 'COPIED';

const defaultOwner: ParticipantFriend = {
  id: 'owner',
  name: '나',
  phoneNumber: '',
  phoneSuffix: '0000',
  initial: '나',
  colorClassName: 'bg-erum-main',
};

function toUserIdFromFriendId(friendId: string) {
  const userId = Number(friendId);

  return Number.isFinite(userId) && userId > 1 ? userId : undefined;
}

function toDisplayDutchInviteUrl(inviteToken: string, fallbackUrl: string) {
  if (!__DEV__) {
    return fallbackUrl;
  }

  return Linking.createURL(`payment/dutch-pay-invite/${encodeURIComponent(inviteToken)}`);
}

function toDisplayRemoteInviteUrl(remoteRequestId: number) {
  return Linking.createURL(`payment/remote-pay-invite/${encodeURIComponent(remoteRequestId)}`);
}

function toParticipantFriend(friend: AuthFriendResponse): ParticipantFriend {
  const phoneSuffix = friend.phoneLastFour || String(friend.userId).padStart(4, '0').slice(-4);

  return {
    id: String(friend.userId),
    name: friend.name || `사용자 ${friend.userId}`,
    phoneNumber: `010-****-${phoneSuffix}`,
    phoneSuffix,
    initial: (friend.name || '사').slice(0, 1),
    colorClassName: friend.isFavorite ? 'bg-erum-main' : 'bg-[#2E7CF6]',
    favorite: friend.isFavorite,
  };
}

function toOwnerParticipantFriend(profile: {
  name: string;
  phone: string;
}): ParticipantFriend {
  const phoneNumber = profile.phone || '';
  const phoneSuffix = phoneNumber.replace(/-/g, '').slice(-4) || '0000';
  const name = profile.name || '나';

  return {
    id: 'owner',
    name,
    phoneNumber,
    phoneSuffix,
    initial: name.slice(0, 1),
    colorClassName: 'bg-erum-main',
  };
}

function getModeContent(mode: ParticipantSelectMode) {
  if (mode === 'DUTCH_PAY') {
    return {
      title: '더치페이 그룹 생성',
      shareTitle: 'URL로 참여자 초대',
      shareDescription: '친구 목록에 없는 사람은 링크를 공유해서 초대하세요.',
      ctaLabel: '그룹 생성하기',
      emptyLabel: '등록된 친구가 없습니다.',
      noResultLabel: '검색 결과가 없습니다.',
    };
  }

  return {
    title: '원격결제 요청',
    shareTitle: 'URL로 원격결제 요청',
    shareDescription: '친구 목록에 없는 사람은 링크를 공유해서 요청하세요.',
    ctaLabel: '원격결제 요청하기',
    emptyLabel: '등록된 친구가 없습니다.',
    noResultLabel: '검색 결과가 없습니다.',
  };
}

function ParticipantSelectHeader({
  title,
  onPressClose,
}: {
  title: string;
  onPressClose: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between bg-neutral-white px-4 py-3">
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

function CheckCircle({ selected }: { selected: boolean }) {
  return (
    <View
      className={`h-6 w-6 items-center justify-center rounded-full border ${
        selected ? 'border-erum-main bg-erum-main' : 'border-neutral-grey1 bg-neutral-white'
      }`}
    >
      {selected ? (
        <Feather name="check" size={14} color={colors.neutral.white} />
      ) : null}
    </View>
  );
}

function OwnerCard({ owner }: { owner: ParticipantFriend }) {
  return (
    <FriendListItem
      name={owner.name}
      initial={owner.initial}
      phoneNumber={owner.phoneNumber}
      profileImageUrl={owner.profileImageUrl}
      avatarColorClassName={owner.colorClassName}
      containerClassName="mb-5 flex-row items-center rounded-xl border border-erum-secondary bg-[#EDFFF8] px-4 py-4"
      contentClassName="ml-4 min-w-0 flex-1"
    />
  );
}

function FriendRow({
  friend,
  selected,
  onPress,
}: {
  friend: ParticipantFriend;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <FriendListItem
      name={friend.name}
      initial={friend.initial}
      phoneSuffix={friend.phoneSuffix}
      phoneNumber={friend.phoneNumber}
      profileImageUrl={friend.profileImageUrl}
      avatarColorClassName={friend.colorClassName}
      containerClassName={`flex-row items-center rounded-xl px-3 py-3 ${
        selected
          ? 'border border-erum-main bg-[#EDFFF8]'
          : 'border border-transparent bg-neutral-grey2'
      }`}
      leading={<CheckCircle selected={selected} />}
      avatarWrapperClassName="ml-3"
      nameSuffix={
        friend.favorite ? (
          <Feather
            name="star"
            size={13}
            color="#F2B705"
            style={{ marginLeft: 4 }}
          />
        ) : null
      }
      right={
        selected ? (
          <Feather name="check" size={18} color={colors.erum.main} />
        ) : null
      }
      onPress={onPress}
    />
  );
}

function FriendSection({
  title,
  iconName,
  iconColor,
  count,
  friends,
  selectedFriendIds,
  showSelectAll,
  onPressFriend,
  onPressSelectAll,
}: {
  title: string;
  iconName: React.ComponentProps<typeof Feather>['name'];
  iconColor: string;
  count: number;
  friends: ParticipantFriend[];
  selectedFriendIds: string[];
  showSelectAll: boolean;
  onPressFriend: (friendId: string) => void;
  onPressSelectAll: () => void;
}) {
  if (friends.length === 0) {
    return null;
  }

  return (
    <View className="mt-5">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Feather name={iconName} size={16} color={iconColor} />
          <Text className="ml-1 font-pretendard text-large-bold text-neutral-black1">
            {title}
          </Text>
          <Text className="ml-1 font-pretendard text-normal-regular text-neutral-black2">
            {count}명
          </Text>
        </View>
        {showSelectAll ? (
          <Pressable accessibilityRole="button" onPress={onPressSelectAll}>
            <Text className="font-pretendard text-normal-bold text-erum-main">
              전체 선택
            </Text>
          </Pressable>
        ) : null}
      </View>
      <View className="gap-3">
        {friends.map((friend) => (
          <FriendRow
            key={friend.id}
            friend={friend}
            selected={selectedFriendIds.includes(friend.id)}
            onPress={() => onPressFriend(friend.id)}
          />
        ))}
      </View>
    </View>
  );
}

function EmptyMessage({ message }: { message: string }) {
  return (
    <View className="items-center py-10">
      <Text className="font-pretendard text-large-regular text-neutral-black2">
        {message}
      </Text>
    </View>
  );
}

export default function PaymentParticipantSelectScreen({
  navigation,
  route,
}: Props) {
  const mode = route.params?.mode ?? 'DUTCH_PAY';
  const content = getModeContent(mode);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [autoSplitChecked, setAutoSplitChecked] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareStep, setShareStep] = useState<ShareStep>('READY');
  const [shareCountdown, setShareCountdown] = useState(3);
  const [shareUrl, setShareUrl] = useState('');
  const [isShareLinkLoading, setIsShareLinkLoading] = useState(false);
  const [stopModalVisible, setStopModalVisible] = useState(false);
  const [dutchInviteCompleteModalVisible, setDutchInviteCompleteModalVisible] =
    useState(false);
  const [remoteRequestCompleteModalVisible, setRemoteRequestCompleteModalVisible] =
    useState(false);
  const [isRemoteRequesting, setIsRemoteRequesting] = useState(false);
  const [serverFriends, setServerFriends] = useState<ParticipantFriend[]>([]);
  const [owner, setOwner] = useState<ParticipantFriend>(defaultOwner);
  const setRequesterProgress = useRemotePaymentProgressStore(
    (state) => state.setRequesterProgress,
  );
  const shareCountdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const latestModeRef = useRef(mode);
  const latestAutoSplitCheckedRef = useRef(autoSplitChecked);
  const isDutchPay = mode === 'DUTCH_PAY';
  const normalizedSearchKeyword = searchKeyword.trim().replace(/-/g, '');
  const baseFavoriteFriends = useMemo(
    () => serverFriends.filter((friend) => friend.favorite),
    [serverFriends],
  );
  const baseAllFriends = useMemo(
    () => serverFriends,
    [serverFriends],
  );
  const filterFriends = useCallback((friends: ParticipantFriend[]) => {
    if (!normalizedSearchKeyword) {
      return friends;
    }

    return friends.filter((friend) => {
      const phoneNumber = friend.phoneNumber.replace(/-/g, '');

      return (
        friend.name.includes(normalizedSearchKeyword) ||
        phoneNumber.includes(normalizedSearchKeyword) ||
        friend.phoneSuffix.includes(normalizedSearchKeyword)
      );
    });
  }, [normalizedSearchKeyword]);
  const favoriteFriends = useMemo(
    () => filterFriends(baseFavoriteFriends),
    [baseFavoriteFriends, filterFriends],
  );
  const allFriends = useMemo(
    () => filterFriends(baseAllFriends),
    [baseAllFriends, filterFriends],
  );
  const hasSearchKeyword = normalizedSearchKeyword.length > 0;
  const hasVisibleFriends = favoriteFriends.length > 0 || allFriends.length > 0;
  const selectedCount = selectedFriendIds.length;
  const ctaDisabled = isDutchPay
    ? isRemoteRequesting
    : selectedCount === 0 || isRemoteRequesting;
  const selectedRemoteFriend = useMemo(() => {
    if (isDutchPay) {
      return null;
    }

    const selectedFriendId = selectedFriendIds[0];

    return (
      [...baseFavoriteFriends, ...baseAllFriends].find(
        (friend) => friend.id === selectedFriendId,
      ) ?? null
    );
  }, [
    baseAllFriends,
    baseFavoriteFriends,
    isDutchPay,
    selectedFriendIds,
  ]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadParticipantData = async () => {
        try {
          const [profile, friends] = await Promise.all([
            fetchUserProfile(),
            fetchAuthFriends(),
          ]);

          if (isActive) {
            setOwner(toOwnerParticipantFriend(profile));
            setServerFriends(friends.map(toParticipantFriend));
          }
        } catch {
          if (isActive) {
            setServerFriends([]);
          }
        }
      };

      void loadParticipantData();

      return () => {
        isActive = false;
      };
    }, []),
  );

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

  const handlePressFriend = (friendId: string) => {
    setSelectedFriendIds((prev) => {
      if (isDutchPay) {
        return prev.includes(friendId)
          ? prev.filter((id) => id !== friendId)
          : [...prev, friendId];
      }

      return prev.includes(friendId) ? [] : [friendId];
    });
  };

  useEffect(() => {
    latestModeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    latestAutoSplitCheckedRef.current = autoSplitChecked;
  }, [autoSplitChecked]);

  const clearShareCountdownTimer = useCallback(() => {
    if (shareCountdownTimerRef.current) {
      clearTimeout(shareCountdownTimerRef.current);
      shareCountdownTimerRef.current = null;
    }
  }, []);

  const resetShareModal = useCallback(() => {
    clearShareCountdownTimer();
    setShareModalVisible(false);
    setShareStep('READY');
    setShareCountdown(3);
  }, [clearShareCountdownTimer]);

  const handlePressSelectAll = (friends: ParticipantFriend[]) => {
    if (!isDutchPay) {
      return;
    }

    const friendIds = friends.map((friend) => friend.id);
    setSelectedFriendIds((prev) => {
      const allSelected = friendIds.every((id) => prev.includes(id));

      if (allSelected) {
        return prev.filter((id) => !friendIds.includes(id));
      }

      return Array.from(new Set([...prev, ...friendIds]));
    });
  };

  const handlePressCopyLink = async () => {
    clearShareCountdownTimer();

    try {
      await Clipboard.setStringAsync(shareUrl);
      setShareStep('COPIED');
      setShareCountdown(3);
    } catch {
      Alert.alert('URL 공유', 'URL 복사에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleOpenShareModal = async () => {
    setShareStep('READY');
    setShareCountdown(3);
    setShareUrl('');
    setIsShareLinkLoading(false);
    setShareModalVisible(true);

    if (!isDutchPay) {
      if (!route.params?.remoteRequestId) {
        Alert.alert('원격결제', '원격결제 요청 정보가 없습니다.');
        setShareModalVisible(false);
        return;
      }

      setShareUrl(toDisplayRemoteInviteUrl(route.params.remoteRequestId));
      return;
    }

    if (!route.params?.dutchSessionId) {
      Alert.alert('더치페이', '더치페이 세션 정보가 없습니다.');
      setShareModalVisible(false);
      return;
    }

    try {
      setIsShareLinkLoading(true);
      const inviteLink = await createDutchPayInviteLink(route.params.dutchSessionId);
      setShareUrl(toDisplayDutchInviteUrl(inviteLink.invite_token, inviteLink.invite_url));
    } catch {
      Alert.alert('URL 공유', '더치페이 초대 링크 생성에 실패했습니다.');
      setShareModalVisible(false);
    } finally {
      setIsShareLinkLoading(false);
    }
  };

  useEffect(() => {
    if (!shareModalVisible || shareStep !== 'COPIED') {
      return;
    }

    if (shareCountdown <= 0) {
      resetShareModal();

      if (latestModeRef.current === 'DUTCH_PAY') {
        if (!route.params?.dutchSessionId) {
          Alert.alert('더치페이', '더치페이 세션 정보가 없습니다.');
          return;
        }

        void removeCancelledDutchPaySession(route.params.dutchSessionId);
        navigation.navigate('DutchPayGroup', {
          role: 'OWNER',
          sessionId: route.params.dutchSessionId,
          splitMethod: latestAutoSplitCheckedRef.current ? 'EQUAL' : 'CUSTOM',
          splitType: latestAutoSplitCheckedRef.current ? 'AUTO_SPLIT' : 'MANUAL',
          orderName: route.params?.orderName,
          merchantId: route.params?.merchantId,
        });
        return;
      }

      navigation.navigate('Main');

      return;
    }

    shareCountdownTimerRef.current = setTimeout(() => {
      setShareCountdown((prev) => prev - 1);
    }, 1000);

    return clearShareCountdownTimer;
  }, [
    navigation,
    resetShareModal,
    route.params?.dutchSessionId,
    route.params?.merchantId,
    route.params?.orderName,
    shareCountdown,
    shareModalVisible,
    shareStep,
  ]);

  useEffect(() => {
    return clearShareCountdownTimer;
  }, []);

  const handlePressSubmit = async () => {
    if (isDutchPay) {
      if (!route.params?.dutchSessionId) {
        Alert.alert('더치페이', '더치페이 세션 정보가 없습니다.');
        return;
      }

      const selectedUserIds = selectedFriendIds
        .map(toUserIdFromFriendId)
        .filter((userId): userId is number => userId != null);

      if (selectedUserIds.length > 0) {
        try {
          setIsRemoteRequesting(true);
          await sendDutchPayInviteNotifications({
            sessionId: route.params.dutchSessionId,
            userIds: selectedUserIds,
          });
          setDutchInviteCompleteModalVisible(true);
        } catch {
          Alert.alert('더치페이 초대', '참여자 초대 알림 발송에 실패했습니다.');
        } finally {
          setIsRemoteRequesting(false);
        }

        return;
      }

      navigateToDutchPayGroup();
      return;
    }

    if (!selectedRemoteFriend) {
      return;
    }

    try {
      setIsRemoteRequesting(true);

      const recipientUserId = toUserIdFromFriendId(selectedRemoteFriend.id);

      if (!recipientUserId) {
        throw new Error('recipient user id is invalid');
      }

      if (route.params?.paymentId == null || route.params?.amount == null) {
        throw new Error('원격결제 요청 정보가 없습니다.');
      }

      const response = await requestRemotePayment({
        paymentId: route.params.paymentId,
        remoteRequestId: route.params?.remoteRequestId,
        amount: route.params.amount,
        merchantName: route.params?.orderName ?? '원격결제',
        orderName: route.params?.orderName,
        merchantId: route.params?.merchantId,
        recipientName: selectedRemoteFriend.name,
        recipientPhoneSuffix: selectedRemoteFriend.phoneSuffix,
        recipientUserId: String(recipientUserId),
      });

      setRequesterProgress(response);
    } catch {
      Alert.alert('원격결제 요청', '원격결제 요청에 실패했습니다.');
      return;
    } finally {
      setIsRemoteRequesting(false);
    }

    setRemoteRequestCompleteModalVisible(true);
  };

  const handleConfirmRemoteRequestComplete = () => {
    setRemoteRequestCompleteModalVisible(false);
    navigation.navigate('Main');
  };

  const navigateToDutchPayGroup = useCallback(() => {
    if (!route.params?.dutchSessionId) {
      Alert.alert('더치페이', '더치페이 세션 정보가 없습니다.');
      return;
    }

    void removeCancelledDutchPaySession(route.params.dutchSessionId);
    navigation.navigate('DutchPayGroup', {
      role: 'OWNER',
      sessionId: route.params.dutchSessionId,
      splitMethod: latestAutoSplitCheckedRef.current ? 'EQUAL' : 'CUSTOM',
      splitType: latestAutoSplitCheckedRef.current ? 'AUTO_SPLIT' : 'MANUAL',
      orderName: route.params?.orderName,
      merchantId: route.params?.merchantId,
    });
  }, [
    navigation,
    route.params?.dutchSessionId,
    route.params?.merchantId,
    route.params?.orderName,
  ]);

  const handleConfirmDutchInviteComplete = () => {
    setDutchInviteCompleteModalVisible(false);
    navigateToDutchPayGroup();
  };

  return (
    <PageWrap
      scroll={false}
      padded={false}
      backgroundClassName="bg-neutral-white"
      header={
        <>
          <ParticipantSelectHeader
            title={content.title}
            onPressClose={handlePressClose}
          />
          <View className="h-px bg-neutral-grey1" />
        </>
      }
    >
      <View className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-36 pt-5"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full self-center">
            {isDutchPay ? (
              <View className="mb-3 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Text className="font-pretendard text-heading-3 text-neutral-black1">
                    참여자 선택
                  </Text>
                  <View className="ml-2 rounded-full bg-erum-main px-2 py-1">
                    <Text className="font-pretendard text-small-bold text-neutral-white">
                      나 + {selectedCount}명
                    </Text>
                  </View>
                </View>
                <Pressable
                  accessibilityRole="button"
                  className="flex-row items-center rounded-lg border border-neutral-grey1 bg-neutral-white px-4 py-2"
                  onPress={() => void handleOpenShareModal()}
                >
                  <Feather name="link" size={18} color={colors.neutral.black1} />
                  <Text className="ml-2 font-pretendard text-large-bold text-neutral-black1">
                    URL 공유
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                accessibilityRole="button"
                className="mb-5 flex-row items-center justify-center rounded-lg border border-neutral-grey1 bg-neutral-white px-4 py-3"
                onPress={() => void handleOpenShareModal()}
              >
                <Feather name="link" size={18} color={colors.neutral.black1} />
                <Text className="ml-2 font-pretendard text-large-bold text-neutral-black1">
                  URL 공유
                </Text>
              </Pressable>
            )}

            {isDutchPay ? <OwnerCard owner={owner} /> : null}

            <View className="mb-5 flex-row items-center rounded-xl border border-neutral-grey1 bg-neutral-grey2 px-4 py-3">
              <Feather name="search" size={20} color={colors.neutral.black2} />
              <TextInput
                accessibilityLabel="친구 검색"
                className="ml-2 min-w-0 flex-1 font-pretendard text-large-regular text-neutral-black1"
                placeholder="이름 또는 전화번호로 검색"
                placeholderTextColor={colors.neutral.black2}
                value={searchKeyword}
                onChangeText={setSearchKeyword}
              />
            </View>

            {!hasVisibleFriends ? (
              <EmptyMessage
                message={
                  hasSearchKeyword
                    ? content.noResultLabel
                    : content.emptyLabel
                }
              />
            ) : (
              <>
                <FriendSection
                  title="즐겨찾기"
                  iconName="star"
                  iconColor="#F2B705"
                  count={favoriteFriends.length}
                  friends={favoriteFriends}
                  selectedFriendIds={selectedFriendIds}
                  showSelectAll={isDutchPay}
                  onPressFriend={handlePressFriend}
                  onPressSelectAll={() => handlePressSelectAll(favoriteFriends)}
                />

                <FriendSection
                  title="전체 친구"
                  iconName="users"
                  iconColor={colors.neutral.black2}
                  count={allFriends.length}
                  friends={allFriends}
                  selectedFriendIds={selectedFriendIds}
                  showSelectAll={isDutchPay}
                  onPressFriend={handlePressFriend}
                  onPressSelectAll={() => handlePressSelectAll(allFriends)}
                />
              </>
            )}

            <View className="mt-7">
              <NoticeBox
                tone="info"
                description={
                  '참여자 초대 안내\n· 그룹 생성 후 공유 링크로 참여자를 초대할 수 있어요\n· 링크를 받은 참여자가 입장하면 그룹에 추가됩니다\n· 즐겨찾기한 친구는 상단에 표시됩니다'
                }
              />
            </View>
          </View>
        </ScrollView>

        <View className="border-t border-neutral-grey1 bg-neutral-white px-4 pb-5 pt-4">
          {isDutchPay ? (
            <View className="mb-4">
              <Checkbox
                label="n빵으로 자동 분할"
                checked={autoSplitChecked}
                onChange={setAutoSplitChecked}
              />
              <Text className="ml-9 mt-1 font-pretendard text-normal-regular text-neutral-black2">
                인원 확정 후 총 금액을 참여 인원수로 자동 계산합니다
              </Text>
            </View>
          ) : null}

          <Button
            label={isRemoteRequesting ? '요청 중입니다' : content.ctaLabel}
            size="large"
            disabled={ctaDisabled}
            onPress={handlePressSubmit}
          />
        </View>

        <InviteLinkModal
          visible={shareModalVisible}
          title={content.shareTitle}
          description={content.shareDescription}
          linkText={shareUrl}
          isLoading={isShareLinkLoading}
          isCopied={shareStep === 'COPIED'}
          copiedDescription={
            isDutchPay
              ? '친구에게 공유하여 더치페이 그룹 생성을 진행해보세요.'
              : '상대방이 링크를 열면 원격결제 요청을 수락하고 결제를 진행할 수 있어요.'
          }
          copiedNotice={
            isDutchPay
              ? `${shareCountdown}초 뒤 그룹 생성 페이지로 이동합니다.`
              : `${shareCountdown}초 뒤 메인으로 이동합니다.`
          }
          onClose={resetShareModal}
          onPressCopy={handlePressCopyLink}
        />
        <PaymentStopConfirmModal
          visible={stopModalVisible}
          description="중지하셔도 메인에서 결제 진행상태를 확인할 수 있습니다."
          onConfirm={handleConfirmStopPayment}
          onCancel={() => setStopModalVisible(false)}
        />
        <ConfirmModal
          visible={remoteRequestCompleteModalVisible}
          type="one"
          title="원격결제 요청이 전송되었습니다."
          description="메인에서 결제 진행상태를 확인할 수 있습니다."
          confirmLabel="확인"
          onConfirm={handleConfirmRemoteRequestComplete}
          onClose={handleConfirmRemoteRequestComplete}
        />
        <ConfirmModal
          visible={dutchInviteCompleteModalVisible}
          type="one"
          title="더치페이 초대 알림을 보냈습니다."
          description="참여자가 알림 또는 링크를 수락하면 그룹에 추가됩니다."
          confirmLabel="그룹 확인하기"
          onConfirm={handleConfirmDutchInviteComplete}
          onClose={handleConfirmDutchInviteComplete}
        />
      </View>
    </PageWrap>
  );
}
