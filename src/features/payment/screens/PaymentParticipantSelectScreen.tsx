import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { RootStackParamList } from '../../../../App';
import Button from '../../../shared/components/Button';
import Checkbox from '../../../shared/components/Checkbox';
import NoticeBox from '../../../shared/components/NoticeBox';
import PageWrap from '../../../shared/components/PageWrap';
import { colors } from '../../../shared/styles/designTokens';
import {
  getParticipantSelectMockState,
  mockAllFriends,
  mockFavoriteFriends,
} from '../constants/paymentParticipantSelect.mock';
import type {
  ParticipantFriend,
  ParticipantSelectMode,
} from '../types/paymentParticipantSelect.types';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'PaymentParticipantSelect'
>;

type ShareStep = 'READY' | 'COPIED';

const inviteUrl = 'https://erumpay.com/group/abc123';

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

function Avatar({ friend }: { friend: ParticipantFriend }) {
  if (friend.profileImageUrl) {
    return (
      <Image
        source={{ uri: friend.profileImageUrl }}
        className="h-12 w-12 rounded-full"
      />
    );
  }

  return (
    <View
      className={`h-12 w-12 items-center justify-center rounded-full ${friend.colorClassName}`}
    >
      <Text className="font-pretendard text-large-bold text-neutral-white">
        {friend.initial}
      </Text>
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
    <View className="mb-5 flex-row items-center rounded-xl border border-erum-secondary bg-[#EDFFF8] px-4 py-4">
      <Avatar friend={owner} />
      <View className="ml-4 min-w-0 flex-1">
        <View className="flex-row items-center">
          <Text className="font-pretendard text-large-bold text-neutral-black1">
            {owner.name}
          </Text>
          <View className="ml-2 rounded-full bg-erum-main px-2 py-1">
            <Text className="font-pretendard text-small-bold text-neutral-white">
              나
            </Text>
          </View>
        </View>
        <Text className="mt-1 font-pretendard text-large-regular text-neutral-black2">
          {owner.phoneNumber}
        </Text>
      </View>
    </View>
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
    <Pressable
      accessibilityRole="button"
      className={`flex-row items-center rounded-xl px-3 py-3 ${
        selected
          ? 'border border-erum-main bg-[#EDFFF8]'
          : 'border border-transparent bg-neutral-grey2'
      }`}
      onPress={onPress}
    >
      <CheckCircle selected={selected} />
      <View className="ml-3">
        <Avatar friend={friend} />
      </View>
      <View className="ml-3 min-w-0 flex-1">
        <View className="flex-row items-center">
          <Text className="font-pretendard text-large-bold text-neutral-black1">
            {friend.name}({friend.phoneSuffix})
          </Text>
          {friend.favorite ? (
            <Feather
              name="star"
              size={13}
              color="#F2B705"
              style={{ marginLeft: 4 }}
            />
          ) : null}
        </View>
        <Text className="mt-1 font-pretendard text-large-regular text-neutral-black2">
          {friend.phoneNumber}
        </Text>
      </View>
      {selected ? (
        <Feather name="check" size={18} color={colors.erum.main} />
      ) : null}
    </Pressable>
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

function ShareLinkModal({
  visible,
  mode,
  shareStep,
  countdown,
  onClose,
  onPressCopy,
}: {
  visible: boolean;
  mode: ParticipantSelectMode;
  shareStep: ShareStep;
  countdown: number;
  onClose: () => void;
  onPressCopy: () => void;
}) {
  const content = getModeContent(mode);
  const isCopied = shareStep === 'COPIED';
  const copiedDescription =
    mode === 'DUTCH_PAY'
      ? '친구에게 공유하여 더치페이 그룹 생성을 진행해보세요.'
      : '친구에게 공유하여 원격결제를 요청해보세요.';
  const nextStepDescription =
    mode === 'DUTCH_PAY'
      ? `${countdown}초 뒤 그룹 생성 페이지로 이동합니다.`
      : `${countdown}초 뒤 메인으로 이동합니다.`;

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-neutral-black3 px-5">
        <Pressable className="absolute inset-0" onPress={onClose} />
        <View className="w-full max-w-[320px] rounded-2xl bg-neutral-white px-6 pb-6 pt-5">
          <View className="mb-6 flex-row items-center justify-between">
            <View className="min-w-0 flex-1 flex-row items-center">
              <Feather
                name={isCopied ? 'check-circle' : 'link'}
                size={24}
                color={colors.erum.main}
              />
              <Text className="ml-2 min-w-0 flex-1 font-pretendard text-heading-3 text-neutral-black1">
                {isCopied ? 'URL이 복사되었습니다.' : content.shareTitle}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="닫기"
              className="ml-3 h-8 w-8 items-center justify-center"
              onPress={onClose}
            >
              <Feather name="x" size={20} color={colors.neutral.black1} />
            </Pressable>
          </View>

          <Text className="font-pretendard text-large-regular text-neutral-black2">
            {isCopied ? copiedDescription : content.shareDescription}
          </Text>

          <View className="mt-5 rounded-xl border border-neutral-grey1 bg-neutral-grey2 px-4 py-4">
            <Text className="font-pretendard text-large-regular text-neutral-black2">
              {inviteUrl}
            </Text>
          </View>

          {isCopied ? (
            <View className="mt-5 rounded-xl bg-[#EDFFF8] px-4 py-4">
              <Text className="text-center font-pretendard text-large-bold text-erum-main">
                {nextStepDescription}
              </Text>
            </View>
          ) : (
            <View className="mt-5 flex-row gap-3">
              <View className="flex-1">
                <Button label="닫기" variant="secondary" onPress={onClose} />
              </View>
              <View className="flex-1">
                <Button
                  label="링크 복사"
                  leftIcon={
                    <Feather
                      name="copy"
                      size={16}
                      color={colors.neutral.white}
                    />
                  }
                  onPress={onPressCopy}
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
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
  const scenario = route.params?.scenario ?? 'DEFAULT';
  const content = getModeContent(mode);
  const initialState = getParticipantSelectMockState({ mode, scenario });
  const [searchKeyword, setSearchKeyword] = useState(initialState.searchKeyword);
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>(
    initialState.selectedFriendIds,
  );
  const [autoSplitChecked, setAutoSplitChecked] = useState(
    initialState.autoSplitChecked,
  );
  const [shareModalVisible, setShareModalVisible] = useState(
    initialState.shareModalVisible,
  );
  const [shareStep, setShareStep] = useState<ShareStep>('READY');
  const [shareCountdown, setShareCountdown] = useState(3);
  const shareCountdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const isDutchPay = mode === 'DUTCH_PAY';
  const normalizedSearchKeyword = searchKeyword.trim().replace(/-/g, '');
  const filterFriends = (friends: ParticipantFriend[]) => {
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
  };
  const favoriteFriends = useMemo(
    () => filterFriends(initialState.favoriteFriends),
    [initialState.favoriteFriends, normalizedSearchKeyword],
  );
  const allFriends = useMemo(
    () => filterFriends(initialState.allFriends),
    [initialState.allFriends, normalizedSearchKeyword],
  );
  const hasSearchKeyword = normalizedSearchKeyword.length > 0;
  const hasVisibleFriends = favoriteFriends.length > 0 || allFriends.length > 0;
  const selectedCount = selectedFriendIds.length;
  const ctaDisabled = selectedCount === 0;

  const handlePressClose = () => {
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

  const clearShareCountdownTimer = () => {
    if (shareCountdownTimerRef.current) {
      clearTimeout(shareCountdownTimerRef.current);
      shareCountdownTimerRef.current = null;
    }
  };

  const resetShareModal = () => {
    clearShareCountdownTimer();
    setShareModalVisible(false);
    setShareStep('READY');
    setShareCountdown(3);
  };

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
    await Clipboard.setStringAsync(inviteUrl);
    setShareStep('COPIED');
    setShareCountdown(3);
  };

  useEffect(() => {
    if (!shareModalVisible || shareStep !== 'COPIED') {
      return;
    }

    if (shareCountdown <= 0) {
      resetShareModal();

      if (mode === 'DUTCH_PAY') {
        navigation.navigate('DutchPayGroup', {
          role: 'OWNER',
          scenario: 'OWNER_INITIAL',
          splitType: autoSplitChecked ? 'AUTO_SPLIT' : 'MANUAL',
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
    autoSplitChecked,
    mode,
    navigation,
    shareCountdown,
    shareModalVisible,
    shareStep,
  ]);

  useEffect(() => {
    return clearShareCountdownTimer;
  }, []);

  const handlePressSubmit = () => {
    if (isDutchPay) {
      navigation.navigate('DutchPayGroup', {
        role: 'OWNER',
        scenario: 'OWNER_INITIAL',
        splitType: autoSplitChecked ? 'AUTO_SPLIT' : 'MANUAL',
      });
      return;
    }

    Alert.alert('원격결제 요청', '선택한 참여자에게 원격결제를 요청합니다.');
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
          contentContainerClassName="px-4 pb-6 pt-5"
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
                  onPress={() => {
                    setShareStep('READY');
                    setShareCountdown(3);
                    setShareModalVisible(true);
                  }}
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
                onPress={() => {
                  setShareStep('READY');
                  setShareCountdown(3);
                  setShareModalVisible(true);
                }}
              >
                <Feather name="link" size={18} color={colors.neutral.black1} />
                <Text className="ml-2 font-pretendard text-large-bold text-neutral-black1">
                  URL 공유
                </Text>
              </Pressable>
            )}

            {isDutchPay ? <OwnerCard owner={initialState.owner} /> : null}

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
                  '참여자 초대 안내\n· 친구 목록에서 참여자를 선택하세요\n· URL 공유로 친구 목록에 없는 사람도 초대 가능해요\n· 즐겨찾기한 친구는 상단에 표시됩니다'
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
            label={content.ctaLabel}
            size="large"
            disabled={ctaDisabled}
            onPress={handlePressSubmit}
          />
        </View>

        <ShareLinkModal
          visible={shareModalVisible}
          mode={mode}
          shareStep={shareStep}
          countdown={shareCountdown}
          onClose={resetShareModal}
          onPressCopy={handlePressCopyLink}
        />
      </View>
    </PageWrap>
  );
}
