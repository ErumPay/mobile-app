import { Text, View } from 'react-native';

import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { NoticeBox } from '../../../shared/components/NoticeBox';
import type { CardRegisterFormValues } from '../types/card';
import { formatExpiry, onlyDigits } from '../types/cardFormat';

interface CardRegisterFormProps {
  canSubmit: boolean;
  values: CardRegisterFormValues;
  onChange: <Key extends keyof CardRegisterFormValues>(
    key: Key,
    value: CardRegisterFormValues[Key],
  ) => void;
  onSubmit: () => void;
}

function formatCardNumber(value: string) {
  return onlyDigits(value)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1-');
}


export function CardRegisterForm({
  canSubmit,
  values,
  onChange,
  onSubmit,
}: CardRegisterFormProps) {
  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    onSubmit();
  };

  return (
    <View className="w-full min-w-0 gap-4 overflow-hidden">
      <NoticeBox
        tone="info"
        description="🔒 입력하신 정보는 안전하게 암호화되어 저장됩니다."
      />

      <View className="w-full min-w-0">
        <Input
          label="카드번호"
          type="number"
          placeholder="카드번호를 입력해주세요."
          value={formatCardNumber(values.cardNumber)}
          maxLength={19}
          onChangeText={(value) => onChange('cardNumber', onlyDigits(value).slice(0, 16))}
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
            onChangeText={(value) => onChange('expiry', formatExpiry(value))}
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
            onChangeText={(value) => onChange('cvc', onlyDigits(value))}
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
          onChangeText={(value) => onChange('passwordFirstTwo', onlyDigits(value))}
        />
      </View>

      <View className="w-full min-w-0 overflow-hidden">
        <Input
          label="생년월일"
          type="number"
          placeholder="930315"
          value={values.birthDate}
          maxLength={6}
          onChangeText={(value) => onChange('birthDate', onlyDigits(value))}
        />
        <Text
          numberOfLines={1}
          className="mt-2 w-full min-w-0 text-xs text-slate-500"
        >
          예: 1993년 3월 15일 → 930315
        </Text>
      </View>

      <View className="w-full min-w-0 overflow-hidden">
        <Input
          label="카드 별칭 (선택)"
          type="text"
          placeholder="카드 별칭을 입력해주세요."
          value={values.cardNickname}
          onChangeText={(value) => onChange('cardNickname', value)}
        />
      </View>

      <View className="mt-1 h-px w-full bg-zinc-200" />

      <Button
        label="카드 등록하기"
        disabled={!canSubmit}
        onPress={handleSubmit}
      />
    </View>
  );
}

export default CardRegisterForm;