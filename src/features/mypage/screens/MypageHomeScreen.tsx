import { useState } from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../../App';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { ListItem } from '../../../shared/components/ListItem';
import {
  LogoutDialog,
  WithdrawDialog,
} from '../components/MypageDialogs';
import {
  Divider,
  MenuRow,
  MypageBottomNav,
  MypageFrame,
} from '../components/MypageLayout';
import { mockUserProfile } from '../mocks/mypageMockData';

type Props = NativeStackScreenProps<RootStackParamList, 'MypageHomeScreen'>;

export function MypageHomeScreen({ navigation }: Props) {
  const [isLogoutVisible, setIsLogoutVisible] = useState(false);
  const [isWithdrawVisible, setIsWithdrawVisible] = useState(false);

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('Main');
  };

  const handleChangeBottomNav = (value: string) => {
    if (value === 'home') {
      navigation.navigate('Main');
    }
  };

  return (
    <>
      <MypageFrame title="마이페이지" onBack={handleGoBack} backgroundClassName="bg-neutral-white">
        <View className="gap-5 pb-28">
          <Card>
            <View className="flex-row items-center">
              <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-erum-main">
                <Text className="font-pretendard text-heading-2 text-neutral-white">
                  {mockUserProfile.name.slice(0, 1)}
                </Text>
              </View>

              <View className="min-w-0 flex-1">
                <Text className="font-pretendard text-heading-3 text-neutral-black1">
                  {mockUserProfile.name} ({mockUserProfile.maskedId})
                </Text>
                <Text className="mt-1 font-pretendard text-large-regular text-neutral-black2">
                  {mockUserProfile.phone}
                </Text>
              </View>
            </View>

            <View className="mt-4">
              <Button
                label="내 정보 확인"
                onPress={() => navigation.navigate('ProfileConfirmScreen')}
              />
            </View>
          </Card>

          <View className="flex-row gap-3">
            <ShortcutCard title="친구관리" icon="👥" />
            <ShortcutCard title="알림" icon="🔔" />
          </View>

          <Card title="나의 관리">
            <MenuRow
              title="결제내역"
              left={<MenuIcon value="💳" />}
              onPress={() => navigation.navigate('PaymentHistoryScreen')}
            />
            <Divider />
            <MenuRow
              title="카드관리"
              left={<MenuIcon value="💼" />}
              onPress={() => navigation.navigate('CardManagementScreen')}
            />
          </Card>

          <Card title="설정">
            <ListItem title="알림 설정" right={<Text className="text-neutral-black2">›</Text>} />
            <Divider />
            <ListItem title="보안 설정" right={<Text className="text-neutral-black2">›</Text>} />
            <Divider />
            <ListItem title="약관 및 정책" right={<Text className="text-neutral-black2">›</Text>} />
            <Divider />
            <ListItem title="앱 버전" right={<Text className="font-pretendard text-normal-regular text-neutral-black2">v1.0.0</Text>} />
          </Card>

          <View className="flex-row justify-center gap-6">
            <Button
              label="회원탈퇴"
              variant="ghost"
              onPress={() => setIsWithdrawVisible(true)}
            />
            <Button
              label="로그아웃"
              variant="ghost"
              onPress={() => setIsLogoutVisible(true)}
            />
          </View>
        </View>
      </MypageFrame>

      <MypageBottomNav active="my" onChange={handleChangeBottomNav} />

      <LogoutDialog
        visible={isLogoutVisible}
        onConfirm={() => setIsLogoutVisible(false)}
        onClose={() => setIsLogoutVisible(false)}
      />
      <WithdrawDialog
        visible={isWithdrawVisible}
        onConfirm={() => setIsWithdrawVisible(false)}
        onClose={() => setIsWithdrawVisible(false)}
      />
    </>
  );
}

function ShortcutCard({ title, icon }: { title: string; icon: string }) {
  return (
    <Card>
      <View className="min-h-[48px] flex-row items-center">
        <MenuIcon value={icon} />
        <Text className="ml-3 font-pretendard text-large-bold text-neutral-black1">
          {title}
        </Text>
      </View>
    </Card>
  );
}

function MenuIcon({ value }: { value: string }) {
  return (
    <View className="h-9 w-9 items-center justify-center rounded-full bg-neutral-grey2">
      <Text className="text-heading-3">{value}</Text>
    </View>
  );
}

export default MypageHomeScreen;
