// React Native에서 제공하는 기본 UI 컴포넌트를 가져온다.
// Pressable: 버튼처럼 누를 수 있는 영역
// Text: 글자 표시
// TextInput: 사용자 입력창
// View: 화면 레이아웃을 감싸는 박스
import { Pressable, Text, TextInput, View } from 'react-native';

// 카드등록 폼 입력값의 타입만 가져온다.
// import type은 실제 실행 코드가 아니라 TypeScript 타입 검사에만 사용된다.
import type { CardRegisterFormValues } from '../types/card';

// formatExpiry: 유효기간 입력값을 MM/YY 형태로 변환
// onlyDigits: 입력값에서 숫자만 남김
import { formatExpiry, onlyDigits } from '../types/cardFormat';

// 카드번호 입력 전용 컴포넌트
import { CardNumberInput } from './CardNumberInput';

// 카드 미리보기 UI 컴포넌트
import { CardPreview } from './CardPreview';

// CardRegisterForm 컴포넌트가 부모에게 받을 props 타입 정의
interface CardRegisterFormProps {
  // 등록 버튼 활성화 여부
  // true면 버튼 활성화, false면 비활성화
  canSubmit: boolean;

  // 카드 입력값 전체 객체
  // 카드번호, 유효기간, CVC, 비밀번호, 생년월일, 카드별칭이 들어있다.
  values: CardRegisterFormValues;

  // 입력값이 바뀔 때 부모 컴포넌트의 상태를 변경하기 위한 함수
  // key는 cardNumber, expiry, cvc 같은 필드명만 가능하다.
  // value는 해당 key에 들어갈 값이다.
  onChange: <Key extends keyof CardRegisterFormValues>(
    key: Key,
    value: CardRegisterFormValues[Key],
  ) => void;

  // 등록하기 버튼을 눌렀을 때 실행할 함수
  onSubmit: () => void;
}

// 카드 직접입력 폼 컴포넌트
export function CardRegisterForm({
  canSubmit,
  values,
  onChange,
  onSubmit,
}: CardRegisterFormProps) {
  // 등록하기 버튼 클릭 시 실행되는 내부 함수
  const handleSubmit = () => {
    // 입력값이 유효하지 않으면 아무 동작도 하지 않고 종료
    if (!canSubmit) {
      return;
    }

    // 입력값이 유효하면 부모에게 받은 등록 함수 실행
    onSubmit();
  };

  return (
    // 전체 폼 영역
    <View className="gap-6">
      {/* 입력된 카드번호/별칭을 카드 형태로 미리 보여주는 영역 */}
      <CardPreview
        cardNumber={values.cardNumber}
        cardCompany="카드사"
        cardName={values.cardNickname || '카드명'}
      />

      {/* 입력 필드 전체 영역 */}
      <View className="gap-4">
        {/* 카드번호 입력 컴포넌트 */}
        <CardNumberInput
          value={values.cardNumber}
          onChangeText={(value) => onChange('cardNumber', onlyDigits(value))}
        />

        {/* 유효기간, CVC 입력 영역 */}
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="mb-2 text-sm font-semibold text-zinc-800">
              유효기간
            </Text>

            {/* 유효기간 입력창 */}
            <TextInput
              className="rounded-xl border border-zinc-200 bg-white px-4 py-4 text-base font-semibold text-zinc-950"
              keyboardType="number-pad"
              maxLength={5}
              placeholder="MM/YY"
              placeholderTextColor="#a1a1aa"
              value={values.expiry}
              onChangeText={(value) => onChange('expiry', formatExpiry(value))}
            />
          </View>

          <View className="flex-1">
            <Text className="mb-2 text-sm font-semibold text-zinc-800">CVC</Text>

            {/* CVC 입력창 */}
            <TextInput
              className="rounded-xl border border-zinc-200 bg-white px-4 py-4 text-base font-semibold text-zinc-950"
              keyboardType="number-pad"
              maxLength={3}
              placeholder="000"
              placeholderTextColor="#a1a1aa"
              secureTextEntry
              value={values.cvc}
              onChangeText={(value) => onChange('cvc', onlyDigits(value))}
            />
          </View>
        </View>

        {/* 카드 비밀번호 앞 2자리, 생년월일 입력 영역 */}
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="mb-2 text-sm font-semibold text-zinc-800">
              비밀번호 앞 2자리
            </Text>

            {/* 카드 비밀번호 앞 2자리 입력창 */}
            <TextInput
              className="rounded-xl border border-zinc-200 bg-white px-4 py-4 text-base font-semibold text-zinc-950"
              keyboardType="number-pad"
              maxLength={2}
              placeholder="00"
              placeholderTextColor="#a1a1aa"
              secureTextEntry
              value={values.passwordFirstTwo}
              onChangeText={(value) =>
                onChange('passwordFirstTwo', onlyDigits(value))
              }
            />
          </View>

          <View className="flex-1">
            <Text className="mb-2 text-sm font-semibold text-zinc-800">
              생년월일 6자리
            </Text>

            {/* 생년월일 6자리 입력창 */}
            <TextInput
              className="rounded-xl border border-zinc-200 bg-white px-4 py-4 text-base font-semibold text-zinc-950"
              keyboardType="number-pad"
              maxLength={6}
              placeholder="YYMMDD"
              placeholderTextColor="#a1a1aa"
              value={values.birthDate}
              onChangeText={(value) => onChange('birthDate', onlyDigits(value))}
            />
          </View>
        </View>

        {/* 카드별칭 입력 영역 */}
        <View>
          <Text className="mb-2 text-sm font-semibold text-zinc-800">
            카드별칭(선택)
          </Text>

          {/* 카드별칭은 선택값이므로 자유롭게 문자열 입력 가능 */}
          <TextInput
            className="rounded-xl border border-zinc-200 bg-white px-4 py-4 text-base text-zinc-950"
            placeholder="생활비 카드"
            placeholderTextColor="#a1a1aa"
            value={values.cardNickname}
            onChangeText={(value) => onChange('cardNickname', value)}
          />
        </View>

        {/* 등록하기 버튼 */}
        <Pressable
          accessibilityRole="button"
          className={`h-14 items-center justify-center rounded-xl ${
            canSubmit ? 'bg-emerald-500' : 'bg-zinc-300'
          }`}
          disabled={!canSubmit}
          onPress={handleSubmit}
        >
          <Text className="text-base font-semibold text-white">등록하기</Text>
        </Pressable>
      </View>
    </View>
  );
}

// 다른 파일에서 default import로 가져올 수 있게 내보낸다.
export default CardRegisterForm;