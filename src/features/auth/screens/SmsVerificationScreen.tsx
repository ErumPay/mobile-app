/******************************************************************************
 * File: SmsVerificationScreen.tsx
 * Description: 회원가입 SMS 문자 인증 화면 (JOIN_003, JOIN_003_1)
 * Worker: [FE] 고민균
 * Created: 2026-06-02
 * Note: 카카오에서 가져온 휴대폰 번호로 문자 인증 요청 → 인증번호 입력 → 완료 후 PIN 설정으로 이동
 ******************************************************************************/

import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../../App';
import { PageWrap } from '../../../shared/components/PageWrap';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { Modal } from '../../../shared/components/Modal';
import { colors } from '../../../shared/styles/designTokens';
import { AuthApiError, sendSmsCode, verifySmsCode } from '../api/authApi';

type VerificationStep = 'request' | 'verify' | 'complete';

const TIMER_SECONDS = 180; // 3분
const REQUEST_COOLDOWN_SECONDS = 180;

type Props = NativeStackScreenProps<RootStackParamList, 'SmsVerification'>;

export default function SmsVerificationScreen({ navigation, route }: Props) {
  const flow = route.params?.flow ?? 'SIGNUP';
  const isPinResetFlow = flow === 'PIN_RESET';
  const [step, setStep] = useState<VerificationStep>('request');
  const [phone, setPhone] = useState('');
  const handlePhoneChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) {
      setPhone(digits);
    } else if (digits.length <= 7) {
      setPhone(`${digits.slice(0, 3)}-${digits.slice(3)}`);
    } else {
      setPhone(`${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`);
    }
  };
  const [code, setCode] = useState('');
  const [remainSeconds, setRemainSeconds] = useState(TIMER_SECONDS);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [failModalVisible, setFailModalVisible] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [verificationId, setVerificationId] = useState<number | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [smsReceiverNumber, setSmsReceiverNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requestCooldownSeconds, setRequestCooldownSeconds] = useState(0);
  const [isCodeCopied, setIsCodeCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const requestCooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const requestCooldownEndsAtRef = useRef<number | null>(null);

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
      if (requestCooldownTimerRef.current) {
        clearInterval(requestCooldownTimerRef.current);
      }
    };
  }, []);

  // 타이머 만료 시 자동 재발송
  useEffect(() => {
    if (remainSeconds === 0 && step === 'verify') {
      handleResendSms();
    }
  }, [remainSeconds, step]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const handleRequestSms = async () => {
    if (isLoading || requestCooldownSeconds > 0) return;

    const rawPhone = phone.replace(/-/g, '');
    setIsLoading(true);
    setCodeError('');
    try {
      const res = await sendSmsCode(rawPhone);
      setVerificationId(res.verificationId);
      setVerificationCode(res.verificationCode);
      setSmsReceiverNumber(res.smsReceiverNumber);
      setStep('verify');
      setCode('');
      setCodeError('');
      setRequestCooldownSeconds(0);
      startTimer();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'SMS 발송에 실패했습니다.';
      setCodeError(message);
      if (err instanceof AuthApiError && err.status === 429) {
        startRequestCooldown();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendSms = async () => {
    if (isLoading || requestCooldownSeconds > 0) return;

    const rawPhone = phone.replace(/-/g, '');
    setIsLoading(true);
    setCodeError('');
    try {
      const res = await sendSmsCode(rawPhone);
      setVerificationId(res.verificationId);
      setVerificationCode(res.verificationCode);
      setSmsReceiverNumber(res.smsReceiverNumber);
      setCode('');
      setCodeError('');
      setRequestCooldownSeconds(0);
      startTimer();
    } catch (err) {
      const message = err instanceof Error ? err.message : '재발송에 실패했습니다.';
      setCodeError(message);
      if (err instanceof AuthApiError && err.status === 429) {
        startRequestCooldown();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPhone = () => {
    if (isLoading) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setStep('request');
    setRemainSeconds(TIMER_SECONDS);
    setVerificationId(null);
    setVerificationCode('');
    setSmsReceiverNumber('');
    setCode('');
    setCodeError('');
    setIsCodeCopied(false);
  };

  const handleCopyVerificationCode = async () => {
    if (!verificationCode) return;

    await Clipboard.setStringAsync(verificationCode);
    setIsCodeCopied(true);
    setTimeout(() => setIsCodeCopied(false), 1500);
  };

  const startRequestCooldown = () => {
    requestCooldownEndsAtRef.current = Date.now() + REQUEST_COOLDOWN_SECONDS * 1000;
    if (requestCooldownTimerRef.current) {
      clearInterval(requestCooldownTimerRef.current);
    }

    const updateRequestCooldown = () => {
      if (!requestCooldownEndsAtRef.current) {
        setRequestCooldownSeconds(0);
        return;
      }

      const nextSeconds = Math.max(
        0,
        Math.ceil((requestCooldownEndsAtRef.current - Date.now()) / 1000),
      );

      setRequestCooldownSeconds(nextSeconds);

      if (nextSeconds <= 0 && requestCooldownTimerRef.current) {
        clearInterval(requestCooldownTimerRef.current);
        requestCooldownTimerRef.current = null;
        requestCooldownEndsAtRef.current = null;
      }
    };

    updateRequestCooldown();
    requestCooldownTimerRef.current = setInterval(() => {
      updateRequestCooldown();
    }, 1000);
  };

  const requestButtonLabel = requestCooldownSeconds > 0
    ? `${formatTime(requestCooldownSeconds)} 후 재시도 가능`
    : isLoading
      ? '발송 중...'
      : '문자 인증 요청하기';
  const cooldownErrorMessage = requestCooldownSeconds > 0
    ? `이미 발송된 인증번호가 유효합니다.\n${formatTime(requestCooldownSeconds)} 후 재시도 가능합니다.`
    : codeError;

  const handleVerifyCode = async () => {
    if (isLoading) return;

    if (verificationId == null) {
      setCodeError('인증 요청을 먼저 진행해주세요.');
      setFailModalVisible(true);
      return;
    }

    // MO 인증: 이미 알고 있는 verificationCode 사용
    const codeToVerify = verificationCode || code;
    if (codeToVerify.length !== 6) {
      setCodeError('인증번호 6자리를 입력해주세요.');
      setFailModalVisible(true);
      return;
    }

    setIsLoading(true);
    try {
      await verifySmsCode(verificationId, codeToVerify);
      if (timerRef.current) clearInterval(timerRef.current);
      setStep('complete');
    } catch (err) {
      const raw = err instanceof Error ? err.message : '';
      let userMessage: string;
      if (raw.includes('시간') || raw.includes('timeout') || raw.includes('Timeout')) {
        userMessage = '인증 서버에 연결할 수 없습니다.\n잠시 후 다시 시도해주세요.';
      } else if (raw.includes('Octomo') || raw.includes('octomo') || raw.includes('존재하지 않') || raw.includes('수신')) {
        userMessage = '문자 인증이 확인되지 않았습니다.\n인증코드를 수신번호로 정확히 보냈는지 확인해주세요.';
      } else if (raw.includes('만료') || raw.includes('expired')) {
        userMessage = '인증 시간이 만료되었습니다.\n인증 요청을 다시 해주세요.';
      } else if (raw.includes('일치하지') || raw.includes('불일치') || raw.includes('mismatch')) {
        userMessage = '인증번호가 일치하지 않습니다.\n다시 확인해주세요.';
      } else {
        userMessage = '본인 인증에 실패했습니다.\n잠시 후 다시 시도해주세요.';
      }
      setCodeError(userMessage);
      setFailModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    navigation.navigate('PaymentPin', {
      mode: 'REGISTER',
      flow,
      verificationId: verificationId ?? undefined,
    });
  };

  const handleClose = () => {
    setCancelModalVisible(true);
  };

  const handleConfirmCancel = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCancelModalVisible(false);
    navigation.navigate(isPinResetFlow ? 'MypageHomeScreen' : 'Tutorial');
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
            <View className="mb-8 h-24 w-24 items-center justify-center rounded-full bg-erum-main">
              <View className="h-12 w-12 items-center justify-center rounded-full border-[3px] border-white">
                <Feather name="check" size={28} color="#FFFFFF" />
              </View>
            </View>
            <Text className="mb-3 text-center font-pretendard text-heading-2 text-neutral-black1">
              본인 인증이 완료되었습니다
            </Text>
            <Text className="text-center font-pretendard text-large-regular text-neutral-black2 leading-6">
              안전한 결제를 위해{'\n'}간편비밀번호를 설정해주세요
            </Text>
          </View>
        ) : (
          /* ─── 인증 요청 / 인증번호 입력 (JOIN_003) ─── */
          <ScrollView
            className="flex-1"
            contentContainerClassName="flex-grow px-8 pb-36"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
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
                onChangeText={handlePhoneChange}
                placeholder="010-0000-0000"
                readOnly={step === 'verify'}
              />
              {step === 'verify' && (
                <Pressable
                  accessibilityRole="button"
                  className="mt-2 self-end"
                  onPress={handleEditPhone}
                >
                  <Text className="font-pretendard text-normal-bold text-erum-main underline">
                    번호 수정
                  </Text>
                </Pressable>
              )}
            </View>

            {step === 'request' && cooldownErrorMessage !== '' && (
              <Text className="mb-4 font-pretendard text-normal-regular text-state-error">
                {cooldownErrorMessage}
              </Text>
            )}

            {/* 인증코드 안내 + 인증번호 입력 (발송 후 노출) */}
            {step === 'verify' && (
              <View className="mb-2">
                {/* 타이머 (상단 왼쪽) */}
                <View className="mb-3 flex-row items-center">
                  <Feather name="clock" size={16} color={remainSeconds <= 30 ? colors.state.error : colors.erum.main} />
                  <Text
                    className={`ml-1 font-pretendard text-large-bold ${
                      remainSeconds <= 30 ? 'text-state-error' : 'text-erum-main'
                    }`}
                  >
                    {remainSeconds > 0 ? `남은 시간 ${formatTime(remainSeconds)}` : '시간 초과'}
                  </Text>
                </View>

                {/* MO 인증: 인증코드 & 수신번호 안내 */}
                <View className="mb-5 rounded-lg border border-erum-main bg-neutral-bg px-5 py-4">
                  <View className="mb-4 flex-row items-center gap-2">
                    <View className="h-7 w-7 items-center justify-center rounded-full bg-erum-main">
                      <Feather name="message-circle" size={16} color="#FFFFFF" />
                    </View>
                    <Text className="min-w-0 flex-1 font-pretendard text-normal-bold text-neutral-black1">
                      아래 인증코드를 문자로 보내주세요
                    </Text>
                  </View>

                  <View className="gap-2">
                    <View className="rounded-lg bg-neutral-white px-4 py-3">
                      <Text className="mb-1 font-pretendard text-normal-regular text-neutral-black2">
                        수신번호
                      </Text>
                      <Text className="font-pretendard text-heading-3 text-neutral-black1">
                        {smsReceiverNumber || '1666-3538'}
                      </Text>
                    </View>

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="인증코드 복사"
                      className="rounded-lg bg-neutral-white px-4 py-3"
                      onPress={handleCopyVerificationCode}
                    >
                      <Text className="mb-1 font-pretendard text-normal-regular text-neutral-black2">
                        인증코드
                      </Text>
                      <View className="flex-row items-center justify-between gap-3">
                        <Text className="font-pretendard text-heading-3 text-erum-main">
                          {verificationCode}
                        </Text>
                        <Feather name="copy" size={18} color={colors.erum.main} />
                      </View>
                      <Text className="mt-1 font-pretendard text-small-regular text-neutral-black2">
                        {isCodeCopied ? '복사되었습니다.' : '눌러서 복사'}
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* 쿨다운 안내 (모달 아닌 인라인) */}
                {requestCooldownSeconds > 0 && (
                  <Text className="mt-2 font-pretendard text-normal-regular text-state-error">
                    {cooldownErrorMessage}
                  </Text>
                )}
              </View>
            )}
          </ScrollView>
        )}

        {/* 하단 버튼 */}
        <View className="border-t border-neutral-grey1 px-8 pt-2 pb-10">
          {step === 'request' && (
            <Button
              label={requestButtonLabel}
              variant="primary"
              size="large"
              disabled={isLoading || requestCooldownSeconds > 0}
              onPress={handleRequestSms}
            />
          )}
          {step === 'verify' && (
            <Button
              label={isLoading ? '확인 중...' : '인증 확인'}
              variant="primary"
              size="large"
              disabled={(code.length !== 6 && !verificationCode) || isLoading}
              onPress={handleVerifyCode}
            />
          )}
          {step === 'complete' && (
            <Button
              label={
                isPinResetFlow
                  ? '간편비밀번호 재설정하기'
                  : '간편 비밀번호 등록하기'
              }
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
        icon={
          <View className="h-14 w-14 items-center justify-center rounded-full bg-[#FF9500]">
            <Feather name="alert-triangle" size={30} color="#FFFFFF" />
          </View>
        }
        title={
          isPinResetFlow
            ? '간편비밀번호 재설정을 중지하시겠습니까?'
            : '회원가입을 중지하시겠습니까?'
        }
        description={
          isPinResetFlow
            ? '중지하면 마이페이지로 돌아갑니다.'
            : '종료 시 카카오톡 인증부터 다시 시작합니다.'
        }
        confirmLabel="예"
        cancelLabel="아니오"
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelModalVisible(false)}
        onClose={() => setCancelModalVisible(false)}
      />

      {/* 인증 실패 모달 */}
      <Modal
        visible={failModalVisible}
        type="one"
        icon={
          <View className="h-14 w-14 items-center justify-center rounded-full bg-state-error">
            <Feather name="x" size={30} color="#FFFFFF" />
          </View>
        }
        title="인증에 실패했어요"
        description={codeError || '잠시 후 다시 시도해주세요.'}
        confirmLabel="확인"
        onConfirm={() => setFailModalVisible(false)}
        onClose={() => setFailModalVisible(false)}
      />

    </PageWrap>
  );
}
