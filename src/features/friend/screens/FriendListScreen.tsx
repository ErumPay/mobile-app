import { Feather, MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Image, Modal as RNModal, Pressable, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../../App';
import {
  deleteAuthFriend,
  acceptFriendRequest,
  createFriendInviteLink,
  fetchAuthFriends,
  fetchReceivedFriendRequests,
  rejectFriendRequest,
  type AuthFriendResponse,
  type AuthFriendRequestResponse,
  updateAuthFriendFavorite,
} from '../api/friendApi';
import ActionMenu from '../../../shared/components/ActionMenu';
import { Button } from '../../../shared/components/Button';
import { EmptyState } from '../../../shared/components/EmptyState';
import { FloatingButton } from '../../../shared/components/FloatingButton';
import Header from '../../../shared/components/Header';
import InviteLinkModal from '../../../shared/components/InviteLinkModal';
import PageWrap from '../../../shared/components/PageWrap';
import FriendListItem from '../../../shared/components/FriendListItem';
import { colors } from '../../../shared/styles/designTokens';

type Props = NativeStackScreenProps<RootStackParamList, 'FriendListScreen'>;

type FriendListEntry = AuthFriendResponse & {
  avatarColorClassName: string;
  phoneNumber: string;
};

type FriendRequestEntry = AuthFriendRequestResponse & {
  avatarColorClassName: string;
  phoneNumber: string;
};

const friendAddIcon = require('../../../assets/images/friend-add.png');

const avatarColorClasses = ['bg-[#9E42F4]', 'bg-[#F02892]', 'bg-[#08C752]', 'bg-[#2FAB84]'];

function toDisplayFriend(friend: AuthFriendResponse, index: number): FriendListEntry {
  return {
    ...friend,
    phoneNumber: `010-****-${friend.phoneLastFour}`,
    avatarColorClassName: avatarColorClasses[index % avatarColorClasses.length],
  };
}

function toDisplayFriendRequest(request: AuthFriendRequestResponse, index: number): FriendRequestEntry {
  return {
    ...request,
    phoneNumber: `010-****-${request.phoneLastFour}`,
    avatarColorClassName: avatarColorClasses[index % avatarColorClasses.length],
  };
}

export default function FriendListScreen({ navigation }: Props) {
  const [friends, setFriends] = useState<FriendListEntry[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequestEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [openedMenuRelationId, setOpenedMenuRelationId] = useState<number | null>(null);
  const [pendingDeleteFriend, setPendingDeleteFriend] = useState<FriendListEntry | null>(null);
  const [isDeletingFriend, setIsDeletingFriend] = useState(false);
  const [favoriteUpdatingRelationId, setFavoriteUpdatingRelationId] = useState<number | null>(null);
  const [friendAddModalVisible, setFriendAddModalVisible] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [isInviteLinkLoading, setIsInviteLinkLoading] = useState(false);
  const [isInviteLinkCopied, setIsInviteLinkCopied] = useState(false);
  const [processingRequestRelationId, setProcessingRequestRelationId] = useState<number | null>(null);

  const filteredFriends = useMemo(() => {
    const trimmedKeyword = searchKeyword.trim().toLowerCase();

    if (!trimmedKeyword) {
      return friends;
    }

    return friends.filter((friend) => {
      const normalizedName = friend.name.toLowerCase();
      const normalizedPhone = friend.phoneNumber.toLowerCase();
      const normalizedPhoneLastFour = friend.phoneLastFour.toLowerCase();

      return (
        normalizedName.includes(trimmedKeyword) ||
        normalizedPhone.includes(trimmedKeyword) ||
        normalizedPhoneLastFour.includes(trimmedKeyword)
      );
    });
  }, [friends, searchKeyword]);
  const hasVisibleFriendContent = friendRequests.length > 0 || filteredFriends.length > 0;

  const loadFriendData = useCallback(async () => {
    const [nextFriends, nextRequests] = await Promise.all([
      fetchAuthFriends(),
      fetchReceivedFriendRequests(),
    ]);

    setFriends(nextFriends.map(toDisplayFriend));
    setFriendRequests(nextRequests.map(toDisplayFriendRequest));
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      setIsLoading(true);

      loadFriendData()
        .catch((error) => {
          console.warn('[FriendListScreen] failed to fetch friends', error);
        })
        .finally(() => {
          if (isActive) {
            setIsLoading(false);
          }
        });

      return () => {
        isActive = false;
      };
    }, [loadFriendData]),
  );

  const handleToggleFavorite = async (friend: FriendListEntry) => {
    const nextIsFavorite = !friend.isFavorite;

    try {
      setFavoriteUpdatingRelationId(friend.relationId);
      console.log('[FriendListScreen] toggling favorite', {
        isFavorite: nextIsFavorite,
        // relationId: friend.relationId,
        // userId: friend.userId,
      });
      await updateAuthFriendFavorite(friend.userId, nextIsFavorite);
      setFriends((prevFriends) =>
        prevFriends.map((item) =>
          item.relationId === friend.relationId ? { ...item, isFavorite: nextIsFavorite } : item,
        ),
      );
      setOpenedMenuRelationId(null);
      console.log('[FriendListScreen] toggled favorite', {
        isFavorite: nextIsFavorite,
        // relationId: friend.relationId,
        // userId: friend.userId,
      });
    } catch (error) {
      console.warn('[FriendListScreen] failed to toggle favorite', error);
      Alert.alert(
        '즐겨찾기 변경 실패',
        error instanceof Error ? error.message : '즐겨찾기 변경 중 문제가 발생했습니다.',
      );
    } finally {
      setFavoriteUpdatingRelationId(null);
    }
  };

  const handleToggleMoreMenu = (relationId: number) => {
    setOpenedMenuRelationId((prevRelationId) => (prevRelationId === relationId ? null : relationId));
  };

  const handleDeleteFriend = async (friend: FriendListEntry) => {
    try {
      setIsDeletingFriend(true);
      console.log('[FriendListScreen] deleting friend', {
        // relationId: friend.relationId,
        // userId: friend.userId,
      });
      await deleteAuthFriend(friend.userId);
      setFriends((prevFriends) => prevFriends.filter((item) => item.relationId !== friend.relationId));
      setOpenedMenuRelationId(null);
      setPendingDeleteFriend(null);
      console.log('[FriendListScreen] deleted friend', {
        // relationId: friend.relationId,
        // userId: friend.userId,
      });
    } catch (error) {
      console.warn('[FriendListScreen] failed to delete friend', error);
      Alert.alert('친구 삭제 실패', error instanceof Error ? error.message : '친구 삭제 중 문제가 발생했습니다.');
    } finally {
      setIsDeletingFriend(false);
    }
  };

  const handleOpenDeleteModal = (friend: FriendListEntry) => {
    setOpenedMenuRelationId(null);
    setPendingDeleteFriend(friend);
  };

  const handleOpenFriendAddModal = async () => {
    setFriendAddModalVisible(true);
    setInviteLink('');
    setIsInviteLinkCopied(false);

    try {
      setIsInviteLinkLoading(true);
      const link = await createFriendInviteLink();
      setInviteLink(link.inviteUrl);
    } catch {
      setInviteLink('');
      Alert.alert('친구 초대', '초대 링크 생성에 실패했습니다.');
      setFriendAddModalVisible(false);
    } finally {
      setIsInviteLinkLoading(false);
    }
  };

  const handleCopyInviteLink = async () => {
    if (!inviteLink) {
      Alert.alert('초대 링크', '초대 링크를 생성하지 못했습니다. 다시 열어주세요.');
      return;
    }

    await Clipboard.setStringAsync(inviteLink);
    setIsInviteLinkCopied(true);
  };

  const handleAcceptFriendRequest = async (request: FriendRequestEntry) => {
    try {
      setProcessingRequestRelationId(request.relationId);
      await acceptFriendRequest(request.relationId);
      await loadFriendData();
    } catch (error) {
      Alert.alert('친구 요청 수락 실패', error instanceof Error ? error.message : '친구 요청 수락에 실패했습니다.');
    } finally {
      setProcessingRequestRelationId(null);
    }
  };

  const handleRejectFriendRequest = async (request: FriendRequestEntry) => {
    try {
      setProcessingRequestRelationId(request.relationId);
      await rejectFriendRequest(request.relationId);
      setFriendRequests((prevRequests) =>
        prevRequests.filter((item) => item.relationId !== request.relationId),
      );
    } catch (error) {
      Alert.alert('친구 요청 거절 실패', error instanceof Error ? error.message : '친구 요청 거절에 실패했습니다.');
    } finally {
      setProcessingRequestRelationId(null);
    }
  };

  const handleChangeBottomNav = (value: string) => {
    if (value === 'home') {
      navigation.navigate('Main');
      return;
    }

    if (value === 'payment') {
      navigation.navigate('QrScan');
      return;
    }

    if (value === 'my') {
      navigation.navigate('MypageHomeScreen');
    }
  };

  return (
    <>
      <PageWrap
        backgroundClassName="bg-neutral-white"
        padded={false}
        scroll={false}
        header={<Header title="친구" type="back" onPressLeft={() => navigation.goBack()} />}
      >
        <Pressable
          className="flex-1 bg-neutral-white"
          onPress={() => {
            if (openedMenuRelationId !== null) {
              setOpenedMenuRelationId(null);
            }
          }}
        >
          <View className="border-b border-neutral-grey1 px-6 py-4">
            <View className="flex-row items-center gap-4">
              <View className="flex-1 flex-row items-center rounded-2xl bg-neutral-grey2 px-5 py-4">
                <Feather name="search" size={24} color="#8D9298" />
                <TextInput
                  accessibilityLabel="친구 검색"
                  className="ml-3 min-w-0 flex-1 font-pretendard text-large-regular text-neutral-black1"
                  placeholder="친구 검색"
                  placeholderTextColor="#8D9298"
                  value={searchKeyword}
                  onChangeText={setSearchKeyword}
                />
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="친구 추가"
                className="h-11 w-11 items-center justify-center"
                hitSlop={8}
                onPress={handleOpenFriendAddModal}
              >
                <Image source={friendAddIcon} style={{ width: 40, height: 40 }} resizeMode="contain" />
              </Pressable>
            </View>
          </View>

          <View className="flex-1 px-6 pb-28 pt-5">
            <Text className="font-pretendard text-heading-3 text-neutral-black1">친구 {friends.length}</Text>

            <View className="mt-4 gap-4">
              {isLoading ? (
                <View className="rounded-[24px] bg-neutral-grey2 px-6 py-8">
                  <Text className="text-center font-pretendard text-large-regular text-neutral-black2">
                    친구 목록을 불러오는 중입니다.
                  </Text>
                </View>
              ) : friends.length === 0 && friendRequests.length === 0 ? (
                <EmptyState title="등록된 친구가 없습니다." />
              ) : !hasVisibleFriendContent ? (
                <EmptyState title="검색 결과가 없습니다." description="이름 또는 전화번호를 다시 확인해주세요." />
              ) : (
                <>
                  {friendRequests.length > 0 ? (
                    <View className="mb-2 rounded-[24px] border border-erum-main bg-[#EDFFF8] px-5 py-5">
                      <Text className="mb-4 font-pretendard text-large-bold text-neutral-black1">
                        받은 친구 요청 {friendRequests.length}
                      </Text>
                      <View className="gap-3">
                        {friendRequests.map((request) => {
                          const isProcessing = processingRequestRelationId === request.relationId;

                          return (
                            <View key={request.relationId} className="rounded-2xl bg-neutral-white px-4 py-4">
                              <FriendListItem
                                name={request.name}
                                initial={request.name.slice(0, 1)}
                                phoneSuffix={request.phoneLastFour}
                                avatarColorClassName={request.avatarColorClassName}
                                containerClassName="flex-row items-center"
                                avatarWrapperClassName="mr-4"
                                contentClassName="min-w-0 flex-1"
                              />
                              <View className="mt-4 flex-row gap-2">
                                <View className="flex-1">
                                  <Button
                                    label={isProcessing ? '처리 중' : '수락'}
                                    size="medium"
                                    disabled={isProcessing}
                                    onPress={() => void handleAcceptFriendRequest(request)}
                                  />
                                </View>
                                <View className="flex-1">
                                  <Button
                                    label="거절"
                                    variant="secondary"
                                    size="medium"
                                    disabled={isProcessing}
                                    onPress={() => void handleRejectFriendRequest(request)}
                                  />
                                </View>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  ) : null}

                  {filteredFriends.map((friend) => (
                    <View
                      key={friend.relationId}
                      className="relative"
                    >
                      <FriendListItem
                        name={friend.name}
                        initial={friend.name.slice(0, 1)}
                        phoneSuffix={friend.phoneLastFour}
                        avatarColorClassName={friend.avatarColorClassName}
                        containerClassName="flex-row items-center rounded-[24px] bg-neutral-grey2 px-5 py-6"
                        avatarWrapperClassName="mr-4"
                        contentClassName="min-w-0 flex-1"
                        nameClassName="font-pretendard text-heading-3 text-neutral-black1"
                        nameRight={
                          friend.isFavorite ? (
                            <View className="ml-2">
                              <MaterialIcons name="star" size={22} color="#F3B300" />
                            </View>
                          ) : null
                        }
                        right={
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`${friend.name} 더보기`}
                            className="ml-3 h-10 w-10 items-center justify-center"
                            hitSlop={8}
                            onPress={(event) => {
                              event.stopPropagation();
                              handleToggleMoreMenu(friend.relationId);
                            }}
                          >
                            <Feather name="more-vertical" size={22} color={colors.neutral.black2} />
                          </Pressable>
                        }
                      />

                      <ActionMenu
                        visible={openedMenuRelationId === friend.relationId}
                        className="absolute right-3 top-[74px] z-50 min-w-[220px] rounded-[20px] px-7 py-6"
                        items={[
                          {
                            key: friend.isFavorite ? 'unfavorite' : 'favorite',
                            label: friend.isFavorite ? '즐겨찾기 해제' : '즐겨찾기',
                            iconName: 'star',
                            onPress: () => {
                              if (favoriteUpdatingRelationId === friend.relationId) {
                                return;
                              }

                              void handleToggleFavorite(friend);
                            },
                          },
                          {
                            key: 'delete',
                            label: '친구 삭제',
                            iconName: 'user-minus',
                            tone: 'danger',
                            onPress: () => handleOpenDeleteModal(friend),
                          },
                        ]}
                      />
                    </View>
                  ))}
                </>
              )}
            </View>
          </View>
        </Pressable>
      </PageWrap>

      <RNModal
        animationType="fade"
        transparent
        visible={pendingDeleteFriend !== null}
        onRequestClose={() => setPendingDeleteFriend(null)}
      >
        <View className="flex-1 items-center justify-center bg-neutral-black3 px-8">
          <Pressable className="absolute inset-0" onPress={() => setPendingDeleteFriend(null)} />

          <View className="w-full max-w-[520px] rounded-[32px] bg-neutral-white px-8 pb-8 pt-10">
            <View className="items-center">
              <View className="h-32 w-32 items-center justify-center rounded-full bg-[#FF5C5C] shadow-lg">
                <Feather name="x" size={56} color="#FFFFFF" />
              </View>
            </View>

            <Text className="mt-10 text-center font-pretendard text-heading-2 text-neutral-black1">
              {pendingDeleteFriend
                ? `${pendingDeleteFriend.name}(${pendingDeleteFriend.phoneLastFour})님을 삭제 하겠습니까?`
                : ''}
            </Text>

            <View className="mt-10 gap-4">
              <Button
                label={isDeletingFriend ? '삭제 중...' : '삭제하기'}
                size="large"
                disabled={isDeletingFriend}
                onPress={() => (pendingDeleteFriend ? void handleDeleteFriend(pendingDeleteFriend) : undefined)}
              />
              <Button
                label="닫기"
                variant="secondary"
                size="large"
                disabled={isDeletingFriend}
                onPress={() => setPendingDeleteFriend(null)}
              />
            </View>
          </View>
        </View>
      </RNModal>

      <InviteLinkModal
        visible={friendAddModalVisible}
        title="URL로 친구 초대"
        description="친구에게 링크를 공유해서 친구 추가를 진행해보세요."
        linkText={inviteLink}
        isLoading={isInviteLinkLoading}
        isCopied={isInviteLinkCopied}
        copiedDescription="친구에게 공유하여 친구 추가를 진행해보세요."
        copiedNotice="Expo 환경에서는 복사한 링크를 개발용 route로 열어 테스트할 수 있어요."
        onClose={() => setFriendAddModalVisible(false)}
        onPressCopy={() => void handleCopyInviteLink()}
      />

      <FloatingButton value="my" onChange={handleChangeBottomNav} />
    </>
  );
}
