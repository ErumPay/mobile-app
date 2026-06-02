/******************************************************************************
 * File: SmsVerificationScreen.tsx
 * Description: 회원가입 SMS 문자 인증 화면 (JOIN_003, JOIN_003_1)
 * Worker: [FE] 고민균
 * Created: 2026-06-02
 * Note: 카카오에서 가져온 휴대폰 번호로 문자 인증 요청 → 인증번호 입력 → 완료 후 PIN 설정으로 이동
 ******************************************************************************/

import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../../App';
import { PageWrap } from '../../../shared/components/PageWrap';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { Modal } from '../../../shared/components/Modal';
import { colors } from '../../../shared/styles/designTokens';

type VerificationStep = 'request' | 'verify' | 'complete';

const TIMER_SECONDS = 180; // 3분

type Props = NativeStackScreenProps<RootStackParamList, 'SmsVerification'>;

export default function SmsVerificationScreen({ navigation }: Props) {
  const [step, setStep] = useState<VerificationStep>('request');
  const [phone, setPhone] = useState('010-1234-5678'); // TODO: 카카오에서 가져온 번호
  const [code, setCode] = useState('');
  const [remainSeconds, setRemainSeconds] = useState(TIMER_SECONDS);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [codeError, setCodeError] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    setRemainSeconds(TIMER_SECONDS);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRemainSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const handleRequestSms = () => {
    // TODO: 실제 SMS 인증번호 발송 API 호출
    setStep('verify');
    setCode('');
    setCodeError('');
    startTimer();
  };

  const handleResendSms = () => {
    // TODO: 인증번호 재발송 API 호출
    setCode('');
    setCodeError('');
    startTimer();
  };

  const handleVerifyCode = () => {
    // TODO: 실제 인증번호 확인 API 호출
    // 더미: 아무 6자리 입력하면 성공
    if (code.length !== 6) {
      setCodeError('인증번호 6자리를 입력해주세요.');
      return;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setStep('complete');
  };

  const handleNext = () => {
    navigation.navigate('PaymentPin', { mode: 'REGISTER' });
  };

  const handleClose = () => {
    setCancelModalVisible(true);
  };

  const handleConfirmCancel = () => {
    setCancelModalVisible(false);
    navigation.navigate('Tutorial');
  };

  return (
    <PageWrap
      scroll={false}
      padded={false}
      backgroundClassName="bg-neutral-white"
    >
      <View className="flex-1">
        {/* 닫기 버튼 */}
        <View className="flex-row justify-end px-5 py-3">
          <Pressable onPress={handleClose} className="h-10 w-10 items-center justify-center">
            <Feather name="x" size={28} color={colors.neutral.black1} />
          </Pressable>
        </View>

        {step === 'complete' ? (
          /* ─── 인증 완료 (JOIN_003_1) ─── */
          <View className="flex-1 items-center justify-center px-8">
            <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-erum-main">
              <Feather name="check" size={48} color="#FFFFFF" />
            </View>
            <Text className="text-center font-pretendard text-heading-2 text-neutral-black1">
              본인 인증이 완료 되었어요!
            </Text>
          </View>
        ) : (
          /* ─── 인증 요청 / 인증번호 입력 (JOIN_003) ─── */
          <View className="flex-1 px-8">
            {/* 상단 안내 */}
            <View className="mt-4 mb-8 items-center">
              <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-state-success">
                <Feather name="check" size={48} color="#FFFFFF" />
              </View>
              <Text className="mb-2 text-center font-pretendard text-heading-2 text-neutral-black1">
                입력된 문자를 보내면{'\n'}본인인증이 돼요.
              </Text>
              <Text className="text-center font-pretendard text-large-regular text-neutral-black2">
                본인 인증을 위해 아래 버튼을 눌러 인증해주세요.{'\n'}인증메세지를 그대로 보내주세요.
              </Text>
            </View>

            {/* 휴대폰 번호 */}
            <View className="mb-4">
              <Input
                label="휴대폰 번호"
                type="text"
                value={phone}
                onChangeText={setPhone}
                placeholder="010-0000-0000"
                readOnly={step === 'verify'}
              />
            </View>

            {/* 인증번호 입력 (발송 후 노출) */}
            {step === 'verify' && (
              <View className="mb-2">
                <Input
                  label="인증번호"
                  type="number"
                  value={code}
                  onChangeText={(text) => {
                    setCode(text);
                    setCodeError('');
                  }}
                  placeholder="인증번호 6자리 입력"
                  maxLength={6}
                />

                {/* 타이머 + 재발송 */}
                <View className="mt-2 flex-row items-center justify-between">
                  <Text
                    className={`font-pretendard text-large-bold ${
                      remainSeconds <= 30 ? 'text-state-error' : 'text-erum-main'
                    }`}
                  >
                    {remainSeconds > 0 ? formatTime(remainSeconds) : '시간 초과'}
                  </Text>
                  <Pressable onPress={handleResendSms}>
                    <Text className="font-pretendard text-large-regular text-neutral-black2 underline">
                      인증번호 재발송
                    </Text>
                  </Pressable>
                </View>

                {/* 에러 메시지 */}
                {codeError !== '' && (
                  <Text className="mt-2 font-pretendard text-normal-regular text-state-error">
                    {codeError}
                  </Text>
                )}
              </View>
            )}
          </View>
        )}

        {/* 하단 버튼 */}
        <View className="px-8 pb-10">
          {step === 'request' && (
            <Button
              label="문자 인증 요청하기"
              variant="primary"
              size="large"
              onPress={handleRequestSms}
            />
          )}
          {step === 'verify' && (
            <Button
              label="인증 확인"
              variant="primary"
              size="large"
              disabled={code.length !== 6 || remainSeconds === 0}
              onPress={handleVerifyCode}
            />
          )}
          {step === 'complete' && (
            <Button
              label="간편 결제 비밀번호 설정하기"
              variant="primary"
              size="large"
              onPress={handleNext}
            />
          )}
        </View>
      </View>

      {/* 인증 취소 확인 모달 */}
      <Modal
        visible={cancelModalVisible}
        type="two"
        title="본인 인증을 중지하시겠습니까?"
        description="종료 시 카카오톡 인증부터 다시 시작합니다."
        confirmLabel="예"
        cancelLabel="아니오"
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelModalVisible(false)}
        onClose={() => setCancelModalVisible(false)}
      />
    </PageWrap>
  );
}
