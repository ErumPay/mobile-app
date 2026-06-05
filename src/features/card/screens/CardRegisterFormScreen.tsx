import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../shared/components/Button';
import { Header } from '../../../shared/components/Header';
import { Input } from '../../../shared/components/Input';
import { Modal } from '../../../shared/components/Modal';
import { NoticeBox } from '../../../shared/components/NoticeBox';
import { PageWrap } from '../../../shared/components/PageWrap';
import { initialCardRegisterFormValues } from '../mocks/cardMockData';
import type { CardRegisterFormValues } from '../types/card';
import { formatExpiry, isValidExpiry, onlyDigits } from '../types/cardFormat';

interface CardRegisterFormScreenProps {
  onClose: () => void;
  initialValues?: Partial<CardRegisterFormValues> | null;
  isSubmitting?: boolean;
  onSubmit: (values: CardRegisterFormValues) => void;
}

function isRequiredFilled(values: CardRegisterFormValues): boolean {
  return (
    onlyDigits(values.cardNumber).length === 16 &&
    onlyDigits(values.expiry).length === 4 &&
    onlyDigits(values.cvc).length === 3 &&
    onlyDigits(values.passwordFirstTwo).length === 2
  );
}

function formatCardNumber(value: string) {
  return onlyDigits(value)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1-');
}

export function CardRegisterFormScreen({
  onClose,
  initialValues,
  isSubmitting = false,
  onSubmit,
}: CardRegisterFormScreenProps) {
  const [values, setValues] = useState<CardRegisterFormValues>({
    ...initialCardRegisterFormValues,
    ...initialValues,
  });
  const [isExpiryErrorModalVisible, setIsExpiryErrorModalVisible] =
    useState(false);

  const canSubmit = isRequiredFilled(values);

  const handleChange = <Key extends keyof CardRegisterFormValues>(
    key: Key,
    value: CardRegisterFormValues[Key],
  ) => {
    setValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  };

  const handleSubmit = () => {
    if (!canSubmit || isSubmitting) {
      return;
    }

    if (!isValidExpiry(values.expiry)) {
      setIsExpiryErrorModalVisible(true);
      return;
    }

    onSubmit(values);
  };

  return (
    <>
      <PageWrap
        backgroundClassName="bg-neutral-grey2"
        header={<Header title="카드등록" type="close" onPressRight={onClose} />}
      >
        <View className="w-full min-w-0 gap-4 overflow-hidden">
          <NoticeBox
            tone="info"
            description="입력하신 정보는 안전하게 암호화되어 저장됩니다."
          />

          <View className="w-full min-w-0">
            <Input
              label="카드번호"
              type="number"
              placeholder="카드번호를 입력해주세요."
              value={formatCardNumber(values.cardNumber)}
              maxLength={19}
              onChangeText={(value) =>
                handleChange('cardNumber', onlyDigits(value).slice(0, 16))
              }
            />
          </View>

          <View className="w-full min-w-0 flex-row gap-3 overflow-hidden">
            <View className="min-w-0 flex-1 overflow-hidden">
              <Input
                label="유효기간"
                type="number"
                placeholder="MM/YY"
                value={values.expiry}
                maxLength={5}
                onChangeText={(value) =>
                  handleChange('expiry', formatExpiry(value))
                }
              />
            </View>

            <View className="min-w-0 flex-1 overflow-hidden">
              <Input
                label="CVC"
                type="number"
                placeholder="123"
                value={values.cvc}
                maxLength={3}
                secureTextEntry
                onChangeText={(value) =>
                  handleChange('cvc', onlyDigits(value).slice(0, 3))
                }
              />
            </View>
          </View>

          <View className="w-full min-w-0 overflow-hidden">
            <Input
              label="비밀번호 앞 2자리"
              type="number"
              placeholder="**"
              value={values.passwordFirstTwo}
              maxLength={2}
              secureTextEntry
              onChangeText={(value) =>
                handleChange(
                  'passwordFirstTwo',
                  onlyDigits(value).slice(0, 2),
                )
              }
            />
          </View>

          <View className="w-full min-w-0 overflow-hidden">
            <Input
              label="카드 별칭 (선택)"
              type="text"
              placeholder="카드 별칭을 입력해주세요."
              value={values.cardNickname}
              onChangeText={(value) => handleChange('cardNickname', value)}
            />
          </View>

          <View className="mt-1 h-px w-full bg-zinc-200" />

          <Button
            label={isSubmitting ? '등록 중입니다' : '카드 등록하기'}
            disabled={!canSubmit || isSubmitting}
            onPress={handleSubmit}
          />
        </View>
      </PageWrap>

      <Modal
        visible={isExpiryErrorModalVisible}
        type="one"
        title="올바르지 않은 유효기간입니다."
        confirmLabel="확인"
        onConfirm={() => setIsExpiryErrorModalVisible(false)}
        onClose={() => setIsExpiryErrorModalVisible(false)}
      />
    </>
  );
}

export default CardRegisterFormScreen;
