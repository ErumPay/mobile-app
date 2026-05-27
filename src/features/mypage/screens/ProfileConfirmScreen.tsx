import { SafeAreaView, Text, View } from 'react-native';

import { BottomNav, MypageFrame, MypageHeader } from '../components/MypageLayout';

interface ProfileConfirmScreenProps {
  onBack?: () => void;
}

export function ProfileConfirmScreen({ onBack }: ProfileConfirmScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-zinc-50">
      <MypageFrame backgroundClassName="bg-zinc-50">
        <MypageHeader title="내 정보 확인" onBack={onBack} />
        <View className="w-full max-w-[360px] flex-1 self-center px-4 pb-44 pt-6">
          <ReadonlyField label="이름" value="조이훈" />
          <ReadonlyField label="생년월일" value="1993-03-15" />
          <ReadonlyField label="핸드폰번호" value="010-0000-0000" />
        </View>
        <BottomNav active="my" />
      </MypageFrame>
    </SafeAreaView>
  );
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <View className="mb-7 w-full">
      <Text className="mb-3 text-base font-bold text-slate-950">{label}</Text>
      <View className="h-[46px] w-full justify-center rounded-xl border border-zinc-200 bg-zinc-100 px-4">
        <Text className="text-base text-slate-400">{value}</Text>
      </View>
    </View>
  );
}

export default ProfileConfirmScreen;
