import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useEffect, useState } from 'react';
import { Modal as RNModal, Pressable, Text, TextInput, View } from 'react-native';

import type { RootStackParamList } from '../../../../App';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { FloatingButton } from '../../../shared/components/FloatingButton';
import { Header } from '../../../shared/components/Header';
import { Modal } from '../../../shared/components/Modal';
import { PageWrap } from '../../../shared/components/PageWrap';
import { colors } from '../../../shared/styles';
import {
  checkWithdrawPendingTransactions,
  fetchUserProfile,
  logoutUser,
  withdrawUser,
} from '../api/mypageApi';
import { clearAuthSession } from '../../auth/api/authApi';
import type { UserProfile } from '../types/mypage';

type Props = NativeStackScreenProps<RootStackParamList, 'MypageHomeScreen'>;
type FeatherIconName = ComponentProps<typeof Feather>['name'];
type MypageIconTone = 'blue' | 'orange' | 'purple' | 'red' | 'green';

const MYPAGE_ICON_COLORS: Record<
  MypageIconTone,
  { backgroundColor: string; color: string }
> = {
  blue: {
    backgroundColor: '#DCE9FF',
    color: '#246BFE',
  },
  orange: {
    backgroundColor: '#FFEBD0',
    color: '#F05A1A',
  },
  purple: {
    backgroundColor: '#F0DFFF',
    color: '#8A2BE2',
  },
  red: {
    backgroundColor: '#FBD0D3',
    color: '#EF5350',
  },
  green: {
    backgroundColor: '#E1F6EE',
    color: '#2FAB84',
  },
};

export function MypageHomeScreen({ navigation }: Props) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isLogoutVisible, setIsLogoutVisible] = useState(false);
  const [isWithdrawVisible, setIsWithdrawVisible] = useState(false);
  const [isPinResetConfirmVisible, setIsPinResetConfirmVisible] =
    useState(false);
  const [isWithdrawPendingVisible, setIsWithdrawPendingVisible] =
    useState(false);
  const [isWithdrawCompleteVisible, setIsWithdrawCompleteVisible] =
    useState(false);
  const [isWithdrawPinVisible, setIsWithdrawPinVisible] = useState(false);
  const [withdrawPin, setWithdrawPin] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isSubmittingAccountAction, setIsSubmittingAccountAction] =
    useState(false);

  useEffect(() => {
    let isActive = true;

    fetchUserProfile()
      .then((nextProfile) => {
        if (isActive) {
          setProfile(nextProfile);
        }
      })
      .catch((error) => {
        console.warn('Failed to fetch user profile.', error);
      })
      .finally(() => {
        if (isActive) {
          setIsProfileLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('Main');
  };

  const handleChangeBottomNav = (value: string) => {
    if (value === 'home') navigation.navigate('Main');
    if (value === 'payment') navigation.navigate('QrScan');
    if (value === 'my') navigation.navigate('MypageHomeScreen');
  };

  const handleLogout = async () => {
    if (isSubmittingAccountAction) return;

    setIsSubmittingAccountAction(true);

    try {
      await logoutUser();
      await clearAuthSession();
      setIsLogoutVisible(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Tutorial' }],
      });
    } catch (error) {
      console.warn('Failed to logout.', error);
      setIsLogoutVisible(false);
      setActionMessage('로그아웃에 실패했습니다.');
    } finally {
      setIsSubmittingAccountAction(false);
    }
  };

  const handleRequestWithdraw = async () => {
    if (isSubmittingAccountAction) return;

    setIsSubmittingAccountAction(true);
    setIsWithdrawVisible(false);

    try {
      const { hasPending } = await checkWithdrawPendingTransactions();
      if (hasPending) {
        setIsWithdrawPendingVisible(true);
        return;
      }
    } catch {
      // eligibility API 미구현 시 무시하고 진행
    } finally {
      setIsSubmittingAccountAction(false);
    }

    setWithdrawPin('');
    setIsWithdrawPinVisible(true);
  };

  const handleWithdraw = async () => {
    if (isSubmittingAccountAction) return;

    setIsSubmittingAccountAction(true);

    try {
      await withdrawUser(withdrawPin);
      setIsWithdrawPinVisible(false);
      setWithdrawPin('');
      setIsWithdrawCompleteVisible(true);
    } catch (error) {
      console.warn('Failed to withdraw.', error);
      setIsWithdrawVisible(false);
      setIsWithdrawPinVisible(false);
      setActionMessage('회원탈퇴에 실패했습니다.');
    } finally {
      setIsSubmittingAccountAction(false);
    }
  };

  return (
    <>
      <PageWrap
        backgroundClassName="bg-neutral-white"
        header={<Header title="마이페이지" type="back" onPressLeft={handleGoBack} />}
      >
        <View className="gap-5 pb-28">
          <Card>
            {profile ? (
              <>
                <View className="flex-row items-center">
                  <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-erum-main">
                    <Text className="font-pretendard text-heading-2 text-neutral-white">
                      {profile.name.slice(0, 1)}
                    </Text>
                  </View>

                  <View className="min-w-0 flex-1">
                    <Text className="font-pretendard text-heading-3 text-neutral-black1">
                      {profile.name} ({profile.maskedId})
                    </Text>
                    <Text className="mt-1 font-pretendard text-large-regular text-neutral-black2">
                      {profile.phone}
                    </Text>
                  </View>
                </View>

                <View className="mt-4">
                  <Button
                    label="내정보 확인"
                    onPress={() => navigation.navigate('ProfileConfirmScreen')}
                  />
                </View>
              </>
            ) : (
              <View className="min-h-[96px] items-center justify-center">
                <Text className="font-pretendard text-large-regular text-neutral-black2">
                  {isProfileLoading
                    ? '사용자 정보를 불러오는 중입니다.'
                    : '사용자 정보를 불러오지 못했습니다.'}
                </Text>
              </View>
            )}
          </Card>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <ShortcutCard
                title="친구관리"
                iconName="users"
                iconTone="blue"
                onPress={() => navigation.navigate('FriendListScreen')}
              />
            </View>
            <View className="flex-1">
              <ShortcutCard
                title="알림"
                iconName="bell"
                iconTone="orange"
                onPress={() => navigation.navigate('NotificationScreen')}
              />
            </View>
          </View>

          <View className="rounded-xl border border-neutral-grey1 bg-neutral-white px-4 py-3">
            <Text className="mb-3 font-pretendard text-heading-3 text-neutral-black1">
              나의 관리
            </Text>
            <MenuActionRow
              title="결제내역"
              iconName="file-text"
              iconTone="purple"
              onPress={() => navigation.navigate('PaymentHistoryScreen')}
            />
            <Divider />
            <MenuActionRow
              title="카드관리"
              iconName="credit-card"
              iconTone="orange"
              onPress={() => navigation.navigate('CardManagementScreen')}
            />
            <Divider />
            <MenuActionRow
              title="간편비밀번호 재설정"
              iconName="lock"
              iconTone="red"
              onPress={() => setIsPinResetConfirmVisible(true)}
            />
          </View>

          <View className="rounded-xl border border-neutral-grey1 bg-neutral-white px-4 py-3">
            <Text className="mb-3 font-pretendard text-heading-3 text-neutral-black1">
              설정
            </Text>
            <MenuActionRow title="알림 설정" />
            <Divider />
            <MenuActionRow title="보안 설정" />
            <Divider />
            <MenuActionRow title="약관 및 정책" />
            <Divider />
            <MenuActionRow
              title="앱 버전"
              right={
                <Text className="font-pretendard text-normal-regular text-neutral-black2">
                  v1.0.0
                </Text>
              }
            />
          </View>

          <View className="flex-row items-center justify-center gap-6">
            <Pressable onPress={() => setIsWithdrawVisible(true)}>
              <Text className="font-pretendard text-normal-regular text-neutral-black2 underline">
                회원탈퇴
              </Text>
            </Pressable>
            <Pressable onPress={() => setIsLogoutVisible(true)}>
              <Text className="font-pretendard text-normal-regular text-neutral-black2 underline">
                로그아웃
              </Text>
            </Pressable>
          </View>
        </View>
      </PageWrap>

      <FloatingButton value="my" onChange={handleChangeBottomNav} />

      <Modal
        visible={isPinResetConfirmVisible}
        type="two"
        icon={<ModalIcon name="lock" tone="main" />}
        title="간편비밀번호를 재설정하시겠습니까?"
        description="SMS 인증 후 새 간편비밀번호를 등록합니다."
        confirmLabel="예"
        cancelLabel="아니오"
        onConfirm={() => {
          setIsPinResetConfirmVisible(false);
          navigation.navigate('SmsVerification', { flow: 'PIN_RESET' });
        }}
        onCancel={() => setIsPinResetConfirmVisible(false)}
        onClose={() => setIsPinResetConfirmVisible(false)}
      />

      <Modal
        visible={isLogoutVisible}
        type="two"
        icon={<ModalIcon name="log-out" tone="main" />}
        title="로그아웃 하시겠습니까?"
        confirmLabel={
          isSubmittingAccountAction ? '처리 중...' : '로그아웃하기'
        }
        cancelLabel="닫기"
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutVisible(false)}
        onClose={() => setIsLogoutVisible(false)}
      />

      <Modal
        visible={isWithdrawVisible}
        type="two"
        icon={<ModalIcon name="alert-triangle" tone="error" />}
        title="정말 회원 탈퇴를 하시겠습니까?"
        description={'탈퇴 후 모든 데이터가 삭제되며\n복구할 수 없습니다'}
        confirmLabel="회원탈퇴하기"
        cancelLabel="닫기"
        onConfirm={handleRequestWithdraw}
        onCancel={() => setIsWithdrawVisible(false)}
        onClose={() => setIsWithdrawVisible(false)}
      />

      <Modal
        visible={isWithdrawPendingVisible}
        type="one"
        icon={<ModalIcon name="credit-card" tone="main" />}
        title="진행 중인 결제가 있어요!"
        description={
          '아직 정산이 완료되지 않은\n더치페이 또는 원격결제가 있습니다.\n결제를 완료 한 후 다시 시도해 주세요.'
        }
        confirmLabel="확인"
        onConfirm={() => setIsWithdrawPendingVisible(false)}
        onClose={() => setIsWithdrawPendingVisible(false)}
      />

      <Modal
        visible={isWithdrawCompleteVisible}
        type="one"
        icon={<ModalIcon name="check" tone="success" />}
        title="회원 탈퇴가 완료되었습니다."
        confirmLabel="확인"
        onConfirm={async () => {
          await clearAuthSession();
          setIsWithdrawCompleteVisible(false);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Tutorial' }],
          });
        }}
        onClose={() => setIsWithdrawCompleteVisible(false)}
      />

      <WithdrawPinModal
        visible={isWithdrawPinVisible}
        pin={withdrawPin}
        isSubmitting={isSubmittingAccountAction}
        onChangePin={setWithdrawPin}
        onCancel={() => {
          setIsWithdrawPinVisible(false);
          setWithdrawPin('');
        }}
        onConfirm={handleWithdraw}
      />

      <Modal
        visible={Boolean(actionMessage)}
        type="one"
        title={actionMessage ?? ''}
        confirmLabel="확인"
        onConfirm={() => setActionMessage(null)}
        onClose={() => setActionMessage(null)}
      />
    </>
  );
}

function ShortcutCard({
  title,
  iconName,
  iconTone,
  onPress,
}: {
  title: string;
  iconName: FeatherIconName;
  iconTone: MypageIconTone;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className="rounded-xl border border-neutral-grey1 bg-neutral-white px-3 py-3"
      onPress={onPress}
    >
      <View className="min-h-[40px] flex-row items-center">
        <MenuIcon name={iconName} tone={iconTone} size="large" />
        <Text className="ml-2 font-pretendard text-large-bold text-neutral-black1">
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

function MenuActionRow({
  title,
  iconName,
  iconTone = 'green',
  right = <Chevron />,
  onPress,
}: {
  title: string;
  iconName?: FeatherIconName;
  iconTone?: MypageIconTone;
  right?: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className="min-h-[48px] flex-row items-center justify-between"
      onPress={onPress}
    >
      <View className="min-w-0 flex-1 flex-row items-center">
        {iconName ? <MenuIcon name={iconName} tone={iconTone} /> : null}
        <Text
          numberOfLines={1}
          className={`${iconName ? 'ml-3' : ''} font-pretendard text-large-bold text-neutral-black1`}
        >
          {title}
        </Text>
      </View>
      {right}
    </Pressable>
  );
}

function WithdrawPinModal({
  visible,
  pin,
  isSubmitting,
  onChangePin,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  pin: string;
  isSubmitting: boolean;
  onChangePin: (pin: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <RNModal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-neutral-black3 px-9">
        <Pressable className="absolute inset-0" onPress={onCancel} />
        <View className="w-full max-w-[320px] rounded-3xl bg-neutral-white px-6 pb-6 pt-8">
          <Text className="text-center font-pretendard text-heading-3 text-neutral-black1">
            간편 비밀번호 입력
          </Text>
          <TextInput
            className="mt-6 h-12 rounded-xl border border-neutral-grey1 px-4 text-center font-pretendard text-large-regular text-neutral-black1"
            value={pin}
            onChangeText={(value) => onChangePin(value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            keyboardType="number-pad"
            secureTextEntry
            placeholder="PIN 입력"
            placeholderTextColor={colors.neutral.black2}
          />
          <View className="mt-7 gap-3">
            <Button
              label={isSubmitting ? '처리 중...' : '회원탈퇴하기'}
              size="medium"
              variant="danger"
              disabled={pin.length !== 6 || isSubmitting}
              onPress={onConfirm}
            />
            <Button label="닫기" variant="secondary" size="medium" onPress={onCancel} />
          </View>
        </View>
      </View>
    </RNModal>
  );
}

function MenuIcon({
  name,
  tone,
  size = 'normal',
}: {
  name: FeatherIconName;
  tone: MypageIconTone;
  size?: 'normal' | 'large';
}) {
  const iconColors = MYPAGE_ICON_COLORS[tone];
  const iconSize = size === 'large' ? 22 : 20;
  const containerClassName =
    size === 'large'
      ? 'h-12 w-12 items-center justify-center rounded-full'
      : 'h-11 w-11 items-center justify-center rounded-full';

  return (
    <View
      className={containerClassName}
      style={{ backgroundColor: iconColors.backgroundColor }}
    >
      <Feather name={name} size={iconSize} color={iconColors.color} />
    </View>
  );
}

function Chevron() {
  return <Feather name="chevron-right" size={22} color={colors.neutral.black2} />;
}

function ModalIcon({
  name,
  tone,
}: {
  name: FeatherIconName;
  tone: 'main' | 'error' | 'success';
}) {
  const iconColor = {
    main: colors.erum.main,
    error: colors.state.error,
    success: colors.state.success,
  }[tone];

  return (
    <View className="h-16 w-16 items-center justify-center rounded-full bg-neutral-grey2">
      <Feather name={name} size={34} color={iconColor} />
    </View>
  );
}

function Divider() {
  return <View className="my-2 h-px w-full bg-neutral-grey1" />;
}

export default MypageHomeScreen;
