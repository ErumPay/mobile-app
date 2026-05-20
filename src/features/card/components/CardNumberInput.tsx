// React Native에서 기본 UI 컴포넌트를 가져온다.
// Text: "카드번호" 같은 글자를 보여줄 때 사용
// TextInput: 사용자가 카드번호를 입력하는 입력창
// View: Text와 TextInput을 감싸는 레이아웃 박스
import { Text, TextInput, View } from 'react-native';

// 입력값에서 숫자만 남기는 유틸 함수
// 예: "1234-5678" -> "12345678"
import { onlyDigits } from '../types/cardFormat';

// CardNumberInput 컴포넌트가 부모에게 받을 props 타입 정의
interface CardNumberInputProps {
  // 현재 카드번호 값
  value: string;

  // 카드번호가 변경될 때 부모 컴포넌트로 변경된 값을 전달하는 함수
  onChangeText: (value: string) => void;

  // 입력창에 값이 없을 때 보여줄 안내 문구
  // ?가 붙었기 때문에 선택값이다.
  placeholder?: string;
}

// 카드번호 입력 전용 컴포넌트
export function CardNumberInput({
  value,
  onChangeText,

  // 부모가 placeholder를 넘겨주지 않으면 기본값 사용
  placeholder = '0000-0000-0000-0000',
}: CardNumberInputProps) {
  // 화면에 보여줄 카드번호 형식
  // 실제 저장값은 "1234567812345678"처럼 숫자만 저장하고,
  // 화면에는 "1234-5678-1234-5678"처럼 보여준다.
  const formattedValue = onlyDigits(value)
    // 최대 16자리까지만 사용
    .slice(0, 16)

    // 4자리마다 뒤에 하이픈(-) 추가
    // 예: "12345678" -> "1234-5678"
    .replace(/(\d{4})(?=\d)/g, '$1-');

  // 사용자가 입력창에 값을 입력할 때 실행되는 함수
  const handleChangeText = (text: string) => {
    // 사용자가 입력한 값에서 숫자만 남기고,
    // 최대 16자리까지만 잘라서 부모에게 전달한다.
    onChangeText(onlyDigits(text).slice(0, 16));
  };

  return (
    // 카드번호 입력 전체 영역
    <View>
      {/* 입력창 라벨 */}
      <Text className="mb-2 text-sm font-semibold text-zinc-800">
        카드번호
      </Text>

      {/* 카드번호 입력창 */}
      <TextInput
        // NativeWind 스타일
        className="rounded-xl border border-zinc-200 bg-white px-4 py-4 text-lg font-semibold tracking-widest text-zinc-950"

        // 숫자 키패드 표시
        keyboardType="number-pad"

        // 화면에는 하이픈 포함 최대 19글자까지 보임
        // 1234-5678-1234-5678 = 숫자 16개 + 하이픈 3개 = 총 19글자
        maxLength={19}

        // 입력 전 안내 문구
        placeholder={placeholder}

        // placeholder 색상
        placeholderTextColor="#a1a1aa"

        // 카드번호 입력이라는 힌트
        // 일부 플랫폼에서 자동완성/키보드 최적화에 도움
        textContentType="creditCardNumber"

        // 입력창에 보여줄 값
        // 실제 value가 아니라 하이픈이 붙은 formattedValue를 보여준다.
        value={formattedValue}

        // 입력값이 바뀔 때 실행
        onChangeText={handleChangeText}
      />
    </View>
  );
}

// 다른 파일에서 default import로 가져올 수 있게 내보낸다.
export default CardNumberInput;