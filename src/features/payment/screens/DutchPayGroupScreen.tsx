import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../../App';
import Button from '../../../shared/components/Button';
import NoticeBox from '../../../shared/components/NoticeBox';
import PageWrap from '../../../shared/components/PageWrap';
import { colors } from '../../../shared/styles/designTokens';
import DutchPayMemberRow from '../components/DutchPayMemberRow';
import DutchPayTotalNotice from '../components/DutchPayTotalNotice';
import { getMockDutchPayGroupData } from '../constants/dutchPay.mock';

type Props = NativeStackScreenProps<RootStackParamList, 'DutchPayGroup'>;

const nextScenarioByScenario = {
  OWNER_INITIAL: 'OWNER_AUTO_SPLIT_READY',
  OWNER_AUTO_SPLIT_READY: 'OWNER_AMOUNT_INPUT_COMPLETE',
  OWNER_AMOUNT_INPUT_WAITING: 'OWNER_AMOUNT_INPUT_COMPLETE',
  OWNER_AMOUNT_INPUT_COMPLETE: 'OWNER_PAYMENT_PROGRESS',
  OWNER_PAYMENT_REQUEST: 'OWNER_PAYMENT_PROGRESS',
  OWNER_PAYMENT_PROGRESS: 'OWNER_FINAL_PAYMENT_READY',
  OWNER_FINAL_PAYMENT_READY: 'OWNER_FINAL_PAYMENT_READY',
  OWNER_FINAL_PAYMENT_FAILURE: 'OWNER_FINAL_PAYMENT_READY',
  PARTICIPANT_INITIAL: 'PARTICIPANT_AMOUNT_INPUT',
  PARTICIPANT_AMOUNT_INPUT: 'PARTICIPANT_PAYMENT_REQUEST',
  PARTICIPANT_PAYMENT_PROGRESS: 'PARTICIPANT_FINAL_PAYMENT_PROGRESS',
  PARTICIPANT_PAYMENT_REQUEST: 'PARTICIPANT_PAYMENT_PROGRESS',
  PARTICIPANT_FINAL_PAYMENT_PROGRESS: 'PARTICIPANT_FINAL_PAYMENT_PROGRESS',
} as const;

function DutchPayHeader({ onPressClose }: { onPressClose: () => void }) {
  return (
    <View className="flex-row items-center justify-between border-b border-neutral-grey1 bg-neutral-white px-4 py-3">
      <Text className="min-w-0 flex-1 font-pretendard text-heading-3 text-neutral-black1">
        더치페이 결제 그룹 참여
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

export default function DutchPayGroupScreen({ navigation, route }: Props) {
  const role = route.params?.role ?? 'OWNER';
  const scenario = route.params?.scenario;
  const data = getMockDutchPayGroupData({ role, scenario });
  const [openMenuMemberId, setOpenMenuMemberId] = useState<string | null>(null);

  const handlePressClose = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('Main');
  };

  const handlePressPrimary = () => {
    if (data.footer.type !== 'button') {
      return;
    }

    const nextScenario = nextScenarioByScenario[data.scenario];

    if (data.scenario === nextScenario) {
      Alert.alert('더치페이', `${data.footer.label} 화면으로 이동합니다.`);
      return;
    }

    navigation.replace('DutchPayGroup', {
      role: data.role,
      scenario: nextScenario,
    });
  };

  const handlePressSecondary = () => {
    Alert.alert('더치페이', '더치페이 그룹 취소 요청입니다.');
  };

  return (
    <PageWrap
      scroll={false}
      padded={false}
      backgroundClassName="bg-neutral-white"
      header={<DutchPayHeader onPressClose={handlePressClose} />}
    >
      <View className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-6 pt-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-sm self-center">
            <DutchPayTotalNotice amount={data.totalAmount} />

            <View className="mt-9 gap-5">
              {data.members.map((member, index) => (
                <DutchPayMemberRow
                  key={`${data.scenario}-${member.id}`}
                  member={member}
                  isLast={index === data.members.length - 1}
                  menuOpen={openMenuMemberId === member.id}
                  onPressMenu={(memberId) =>
                    setOpenMenuMemberId((prev) => (prev === memberId ? null : memberId))
                  }
                />
              ))}
            </View>

            {data.contentNotice ? (
              <View className="mt-7">
                <NoticeBox
                  tone={data.contentNotice.tone}
                  description={data.contentNotice.message}
                />
              </View>
            ) : null}
          </View>
        </ScrollView>

        <View className="border-t border-neutral-grey1 bg-neutral-white px-4 pb-5 pt-4">
          <View className="w-full max-w-sm self-center">
            {data.footer.type === 'button' ? (
              <>
                <Button
                  label={data.footer.label}
                  size="large"
                  disabled={data.footer.disabled}
                  onPress={handlePressPrimary}
                />
                {data.footer.secondaryLabel ? (
                  <Pressable
                    accessibilityRole="button"
                    className="mt-4 items-center justify-center py-2"
                    onPress={handlePressSecondary}
                  >
                    <Text className="font-pretendard text-normal-regular text-neutral-black2 underline">
                      {data.footer.secondaryLabel}
                    </Text>
                  </Pressable>
                ) : null}
              </>
            ) : (
              <NoticeBox tone={data.footer.tone} description={data.footer.message} />
            )}
          </View>
        </View>
      </View>
    </PageWrap>
  );
}
