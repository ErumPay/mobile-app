import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';

import type { RootStackParamList } from '../../../../App';
import { FloatingButton } from '../../../shared/components/FloatingButton';
import { Header } from '../../../shared/components/Header';
import { Input } from '../../../shared/components/Input';
import { PageWrap } from '../../../shared/components/PageWrap';
import { mockUserProfile } from '../mocks/mypageMockData';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileConfirmScreen'>;

export function ProfileConfirmScreen({ navigation }: Props) {
  return (
    <>
      <PageWrap
        backgroundClassName="bg-neutral-grey2"
        header={
          <Header
            title="내 정보 확인"
            type="back"
            onPressLeft={() => navigation.goBack()}
          />
        }
      >
        <View className="gap-5 pb-28">
          <Input label="이름" value={mockUserProfile.name} readOnly />
          <Input label="생년월일" value={mockUserProfile.birthDate} readOnly />
          <Input label="핸드폰번호" value={mockUserProfile.phone} readOnly />
        </View>
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
