/******************************************************************************
 * File: SignupCompleteScreen.tsx
 * Description: 회원가입 완료 화면 (JOIN_006)
 * Worker: [FE] 고민균
 * Created: 2026-06-02
 * Note: 가입 완료 안내 + 메인화면으로 이동
 ******************************************************************************/

import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../../App';
import { PageWrap } from '../../../shared/components/PageWrap';
import { Header } from '../../../shared/components/Header';
import { Button } from '../../../shared/components/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'SignupComplete'>;

export default function SignupCompleteScreen({ navigation }: Props) {
  const handleGoMain = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  return (
    <PageWrap
      scroll={false}
      padded={false}
      backgroundClassName="bg-neutral-white"
      header={<Header title="회원가입 완료" type="close" onPressRight={handleGoMain} />}
    >
      <View className="flex-1 items-center justify-center px-8">
        <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-erum-main">
          <View className="h-12 w-12 items-center justify-center rounded-full border-[3px] border-white">
            <Feather name="check" size={28} color="#FFFFFF" />
          </View>
        </View>
        <Text className="mb-3 text-center font-pretendard text-heading-2 text-neutral-black1">
          회원가입 완료!
        </Text>
        <Text className="text-center font-pretendard text-large-regular text-neutral-black2 leading-6">
          이제 ErumPay를 사용할 수 있습니다
        </Text>
      </View>

      <View className="px-8 pb-10">
        <Button
          label="메인으로 가기"
          variant="primary"
          size="large"
          onPress={handleGoMain}
        />
      </View>
    </PageWrap>
  );
}
