import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import type { RootStackParamList } from '../../../../App';
import { FloatingButton } from '../../../shared/components/FloatingButton';
import { EmptyState } from '../../../shared/components/EmptyState';
import { Header } from '../../../shared/components/Header';
import { Input } from '../../../shared/components/Input';
import { PageWrap } from '../../../shared/components/PageWrap';
import { fetchUserProfile } from '../api/mypageApi';
import type { UserProfile } from '../types/mypage';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileConfirmScreen'>;

export function ProfileConfirmScreen({ navigation }: Props) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
          if (value === 'payment') navigation.navigate('PaymentMethodSelect');
          if (value === 'my') navigation.navigate('MypageHomeScreen');
        }}
      />
    </>
  );
}

export default ProfileConfirmScreen;
