import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import type { RootStackParamList } from '../../../../App';
import { FloatingButton } from '../../../shared/components/FloatingButton';
import { EmptyState } from '../../../shared/components/EmptyState';
import { Header } from '../../../shared/components/Header';
import { Input } from '../../../shared/components/Input';
import { Modal } from '../../../shared/components/Modal';
import { PageWrap } from '../../../shared/components/PageWrap';
import { Toggle } from '../../../shared/components/Toggle';
import { colors } from '../../../shared/styles';
import { fetchUserProfile } from '../api/mypageApi';
import type { UserProfile } from '../types/mypage';
import {
  canUseBiometricPaymentAuth,
  disableBiometricPayment,
  getBiometricPaymentPin,
  isBiometricPaymentEnabled,
} from '../../payment/utils/biometricPaymentAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileConfirmScreen'>;

export function ProfileConfirmScreen({ navigation }: Props) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canUseBiometric, setCanUseBiometric] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricModalVisible, setBiometricModalVisible] = useState(false);
  const [biometricModalTitle, setBiometricModalTitle] = useState('');
  const [biometricModalDescription, setBiometricModalDescription] = useState('');
  const [disableConfirmVisible, setDisableConfirmVisible] = useState(false);

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
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadBiometricState = async () => {
      try {
        const [nextCanUseBiometric, nextBiometricEnabled] = await Promise.all([
          canUseBiometricPaymentAuth(),
          isBiometricPaymentEnabled(),
        ]);

        if (isActive) {
          setCanUseBiometric(nextCanUseBiometric);
          setBiometricEnabled(nextBiometricEnabled);
        }
      } catch {
        if (isActive) {
          setCanUseBiometric(false);
          setBiometricEnabled(false);
        }
      }
    };

    void loadBiometricState();

    return () => {
      isActive = false;
    };
  }, []);

  const showBiometricGuide = (title: string, description: string) => {
    setBiometricModalTitle(title);
    setBiometricModalDescription(description);
    setBiometricModalVisible(true);
  };

  const handleChangeBiometric = async (value: boolean) => {
    if (value) {
      if (!canUseBiometric) {
        showBiometricGuide(
          '생체 인증을 사용할 수 없습니다.',
          '기기에 Face ID 또는 Touch ID를 먼저 등록해주세요.',
        );
        return;
      }

      const storedPin = await getBiometricPaymentPin();

      if (!storedPin) {
        setBiometricEnabled(false);
        showBiometricGuide(
          '생체 인증 등록이 필요합니다.',
          '간편비밀번호 등록 또는 재설정 완료 후 생체 인증을 사용할 수 있습니다.',
        );
        return;
      }

      setBiometricEnabled(true);
      return;
    }

    setDisableConfirmVisible(true);
  };

  const handleConfirmDisableBiometric = async () => {
    await disableBiometricPayment();
    setBiometricEnabled(false);
    setDisableConfirmVisible(false);
  };

  return (
    <>
      <PageWrap
        backgroundClassName="bg-neutral-grey2"
        header={
          <Header
            title="내정보 확인"
            type="back"
            onPressLeft={() => navigation.goBack()}
          />
        }
      >
        {profile ? (
          <View className="gap-5 pb-28">
            <Input label="이름" value={profile.name} readOnly />
            <Input label="생년월일" value={profile.birthDate} readOnly />
            <Input label="휴대폰번호" value={profile.phone} readOnly />

            <View className="rounded-xl border border-neutral-grey1 bg-neutral-white px-4 py-4">
              <Toggle
                label="생체 인증 사용"
                value={biometricEnabled}
                onChange={handleChangeBiometric}
              />
              <Text className="mt-2 font-pretendard text-normal-regular text-neutral-black2">
                결제 시 Face ID 또는 Touch ID로 간편비밀번호를 대신합니다.
              </Text>
            </View>
          </View>
        ) : (
          <EmptyState
            title={
              isLoading
                ? '사용자 정보를 불러오는 중입니다.'
                : '사용자 정보를 불러오지 못했습니다.'
            }
          />
        )}
      </PageWrap>

      <FloatingButton
        value="my"
        onChange={(value) => {
          if (value === 'home') navigation.navigate('Main');
          if (value === 'payment') navigation.navigate('QrScan');
          if (value === 'my') navigation.navigate('MypageHomeScreen');
        }}
      />

      <Modal
        visible={biometricModalVisible}
        type="one"
        icon={
          <View className="h-14 w-14 items-center justify-center rounded-full bg-erum-main">
            <Feather name="shield" size={30} color={colors.neutral.white} />
          </View>
        }
        title={biometricModalTitle}
        description={biometricModalDescription}
        confirmLabel="확인"
        onConfirm={() => setBiometricModalVisible(false)}
        onClose={() => setBiometricModalVisible(false)}
      />

      <Modal
        visible={disableConfirmVisible}
        type="two"
        icon={
          <View className="h-14 w-14 items-center justify-center rounded-full bg-state-error">
            <Feather name="alert-triangle" size={30} color={colors.neutral.white} />
          </View>
        }
        title="생체 인증을 해제하시겠습니까?"
        description="해제하면 결제 시 간편비밀번호를 직접 입력해야 합니다."
        confirmLabel="해제"
        cancelLabel="취소"
        onConfirm={handleConfirmDisableBiometric}
        onCancel={() => setDisableConfirmVisible(false)}
        onClose={() => setDisableConfirmVisible(false)}
      />
    </>
  );
}

export default ProfileConfirmScreen;
