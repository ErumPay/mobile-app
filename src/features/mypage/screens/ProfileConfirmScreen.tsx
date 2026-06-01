import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';

import type { RootStackParamList } from '../../../../App';
import { Input } from '../../../shared/components/Input';
import { MypageBottomNav, MypageFrame } from '../components/MypageLayout';
import { mockUserProfile } from '../mocks/mypageMockData';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileConfirmScreen'>;

export function ProfileConfirmScreen({ navigation }: Props) {
  return (
    <>
      <MypageFrame
        title="내 정보 확인"
        onBack={() => navigation.goBack()}
        backgroundClassName="bg-neutral-grey2"
      >
        <View className="gap-5 pb-28">
          <Input label="이름" value={mockUserProfile.name} readOnly />
          <Input label="생년월일" value={mockUserProfile.birthDate} readOnly />
          <Input label="핸드폰번호" value={mockUserProfile.phone} readOnly />
        </View>
      </MypageFrame>
      <MypageBottomNav
        active="my"
        onChange={(value) => {
          if (value === 'home') navigation.navigate('Main');
        }}
      />
    </>
  );
}

export default ProfileConfirmScreen;
