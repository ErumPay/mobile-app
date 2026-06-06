/******************************************************************************
 * File: TermsAgreementScreen.tsx
 * Description: 회원가입 약관동의 화면 (JOIN_002)
 * Worker: [FE] 고민균
 * Created: 2026-06-02
 * Note: 필수 약관 3개 + 만 14세 확인 체크 시 다음 버튼 활성화
 ******************************************************************************/

import { useState } from 'react';
import { Modal as RNModal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../../App';
import { PageWrap } from '../../../shared/components/PageWrap';
import { Header } from '../../../shared/components/Header';
import { Button } from '../../../shared/components/Button';
import { colors } from '../../../shared/styles/designTokens';

type TermItem = {
  id: string;
  label: string;
  required: boolean;
  hasDetail: boolean;
};

const terms: TermItem[] = [
  { id: 'service', label: '서비스 이용약관', required: true, hasDetail: true },
  { id: 'finance', label: '금융 서비스 이용약관', required: true, hasDetail: true },
  { id: 'privacy', label: '개인정보 수집이용', required: true, hasDetail: true },
  { id: 'age', label: '본인은 만 14세 이상입니다.', required: true, hasDetail: false },
  {
    id: 'marketing',
    label: '마케팅 활용 및 SMS 및 이메일 수신동의',
    required: false,
    hasDetail: true,
  },
];

const requiredIds = terms.filter((t) => t.required).map((t) => t.id);

type Props = NativeStackScreenProps<RootStackParamList, 'TermsAgreement'>;

export default function TermsAgreementScreen({ navigation }: Props) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [termsModalTitle, setTermsModalTitle] = useState('');

  const allRequiredChecked = requiredIds.every((id) => checked[id]);
  const allChecked = terms.every((t) => checked[t.id]);

  const toggleItem = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAll = () => {
    if (allChecked) {
      setChecked({});
    } else {
      const all: Record<string, boolean> = {};
      terms.forEach((t) => {
        all[t.id] = true;
      });
      setChecked(all);
    }
  };

  const openTermsDetail = (title: string) => {
    setTermsModalTitle(title);
    setTermsModalVisible(true);
  };

  const handleNext = () => {
    navigation.navigate('SmsVerification');
  };

  return (
    <PageWrap
      scroll={false}
      padded={false}
      backgroundClassName="bg-neutral-white"
      header={
        <Header
          title="회원가입"
          type="back"
          onPressLeft={() => navigation.goBack()}
        />
      }
    >
      <View className="flex-1 px-5 pt-6">
        {/* 타이틀 */}
        <Text className="mb-8 font-pretendard text-heading-2 text-neutral-black1">
          회원가입을 위해{'\n'}약관에 동의해 주세요
        </Text>

        {/* 전체동의 */}
        <Pressable
          className="mb-4 flex-row items-center gap-3 rounded-lg border border-neutral-grey1 px-4 py-4"
          onPress={toggleAll}
        >
          <View
            className={`h-6 w-6 items-center justify-center rounded-full ${
              allChecked ? 'bg-erum-main' : 'bg-neutral-disabled'
            }`}
          >
            <Feather name="check" size={16} color="#FFFFFF" />
          </View>
          <Text className="font-pretendard text-large-bold text-neutral-black1">
            전체동의
          </Text>
        </Pressable>

        {/* 구분선 */}
        <View className="mb-4 h-px bg-neutral-grey1" />

        {/* 약관 목록 */}
        <View className="gap-1">
          {terms.map((term) => (
            <View key={term.id} className="flex-row items-center justify-between py-3">
              <Pressable
                className="flex-1 flex-row items-center gap-3"
                onPress={() => toggleItem(term.id)}
              >
                <View
                  className={`h-6 w-6 items-center justify-center rounded-md border ${
                    checked[term.id]
                      ? 'border-erum-main bg-erum-main'
                      : 'border-neutral-grey1 bg-neutral-white'
                  }`}
                >
                  {checked[term.id] && (
                    <Text className="font-pretendard text-normal-bold text-neutral-white">
                      ✓
                    </Text>
                  )}
                </View>
                <Text className="flex-1 font-pretendard text-large-regular text-neutral-black1">
                  <Text className={term.required ? 'text-erum-main' : 'text-neutral-disabled'}>
                    {term.required ? '[필수] ' : '[선택] '}
                  </Text>
                  {term.label}
                </Text>
              </Pressable>

              {term.hasDetail && (
                <Pressable
                  className="ml-2 px-2 py-1"
                  onPress={() => openTermsDetail(term.label)}
                >
                  <Text className="font-pretendard text-normal-regular text-neutral-disabled underline">
                    보기
                  </Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* 하단 버튼 */}
      <View className="px-5 pb-8 pt-4">
        <Button
          label="동의하고 계속하기"
          variant="primary"
          size="large"
          disabled={!allRequiredChecked}
          onPress={handleNext}
        />
      </View>

      {/* 약관 상세 모달 */}
      <RNModal
        animationType="slide"
        visible={termsModalVisible}
        onRequestClose={() => setTermsModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-neutral-white">
          <View className="flex-row items-center justify-between px-5 py-4">
            <Text className="font-pretendard text-heading-3 text-neutral-black1">
              {termsModalTitle}
            </Text>
            <Pressable onPress={() => setTermsModalVisible(false)}>
              <Feather name="x" size={24} color={colors.neutral.black1} />
            </Pressable>
          </View>

          <View className="h-px bg-neutral-grey1" />

          <ScrollView
            className="flex-1 px-5 py-6"
            contentContainerClassName="pb-8"
          >
            {termsModalTitle === '개인정보 수집이용' ? (
              <View className="gap-4">
                <Text className="font-pretendard text-large-bold text-neutral-black1">
                  개인정보 수집 및 이용 동의
                </Text>
                <Text className="font-pretendard text-large-regular text-neutral-black2 leading-6">
                  이룸페이(이하 "회사")는 서비스 제공을 위해 아래와 같이 개인정보를 수집 및 이용합니다.
                </Text>

                {/* 수집 항목 테이블 */}
                <View className="overflow-hidden rounded-lg border border-neutral-grey1">
                  <View className="flex-row bg-neutral-grey2 px-4 py-3">
                    <Text className="flex-1 font-pretendard text-normal-bold text-neutral-black1">
                      수집 항목
                    </Text>
                    <Text className="flex-1 font-pretendard text-normal-bold text-neutral-black1">
                      수집 목적
                    </Text>
                  </View>
                  <View className="h-px bg-neutral-grey1" />
                  <View className="flex-row px-4 py-3">
                    <Text className="flex-1 font-pretendard text-normal-regular text-neutral-black2">
                      이름, 생년월일
                    </Text>
                    <Text className="flex-1 font-pretendard text-normal-regular text-neutral-black2">
                      본인 확인 및 회원 식별
                    </Text>
                  </View>
                  <View className="h-px bg-neutral-grey1" />
                  <View className="flex-row px-4 py-3">
                    <Text className="flex-1 font-pretendard text-normal-regular text-neutral-black2">
                      휴대폰 번호
                    </Text>
                    <Text className="flex-1 font-pretendard text-normal-regular text-neutral-black2">
                      본인 인증 및 알림 발송
                    </Text>
                  </View>
                  <View className="h-px bg-neutral-grey1" />
                  <View className="flex-row px-4 py-3">
                    <Text className="flex-1 font-pretendard text-normal-regular text-neutral-black2">
                      카카오 계정 정보{'\n'}(이메일, 프로필)
                    </Text>
                    <Text className="flex-1 font-pretendard text-normal-regular text-neutral-black2">
                      간편 로그인 및 계정 연동
                    </Text>
                  </View>
                  <View className="h-px bg-neutral-grey1" />
                  <View className="flex-row px-4 py-3">
                    <Text className="flex-1 font-pretendard text-normal-regular text-neutral-black2">
                      간편결제 비밀번호
                    </Text>
                    <Text className="flex-1 font-pretendard text-normal-regular text-neutral-black2">
                      결제 인증
                    </Text>
                  </View>
                </View>

                <Text className="font-pretendard text-large-regular text-neutral-black2 leading-6">
                  • 보유 기간: 회원 탈퇴 시까지 (법령에 따른 보존 의무가 있는 경우 해당 기간까지){'\n\n'}
                  • 이용자는 개인정보 수집 및 이용에 대한 동의를 거부할 수 있으나, 동의하지 않을 경우 회원가입이 제한됩니다.
                </Text>
              </View>
            ) : (
              <Text className="font-pretendard text-large-regular text-neutral-black2 leading-6">
                제 1 조 (목적){'\n\n'}
                본 약관은 이룸페이(이하 "회사")가 제공하는 서비스의 이용과 관련하여
                회사와 이용자 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.
                {'\n\n'}
                제 2 조 (정의){'\n\n'}
                1. "서비스"란 회사가 제공하는 모바일 결제 및 관련 부가 서비스를 의미합니다.
                {'\n'}
                2. "이용자"란 본 약관에 동의하고 회사가 제공하는 서비스를 이용하는 자를 의미합니다.
                {'\n'}
                3. "간편결제"란 이용자가 등록한 결제 수단을 통해 간편하게 결제할 수 있는 서비스를 의미합니다.
                {'\n\n'}
                제 3 조 (약관의 효력 및 변경){'\n\n'}
                1. 본 약관은 서비스를 이용하고자 하는 모든 이용자에게 적용됩니다.
                {'\n'}
                2. 회사는 관련 법령에 위배되지 않는 범위에서 본 약관을 변경할 수 있으며,
                변경된 약관은 서비스 내 공지사항을 통해 공지합니다.
              </Text>
            )}
          </ScrollView>
        </SafeAreaView>
      </RNModal>
    </PageWrap>
  );
}
