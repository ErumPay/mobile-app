// React Native에서 기본 UI 컴포넌트를 가져온다.
// Text: 카드사명, 카드명, 카드번호 같은 글자를 보여줄 때 사용
// View: 카드 전체 박스, 칩 모양 박스 같은 레이아웃을 만들 때 사용
import { Text, View } from 'react-native';

// 입력값에서 숫자만 남기는 유틸 함수
// 예: "1234-5678" -> "12345678"
import { onlyDigits } from '../types/cardFormat';

// CardPreview 컴포넌트가 부모에게 받을 props 타입 정의
interface CardPreviewProps {
  // 카드번호
  cardNumber: string;

  // 카드사명
  // ?가 붙었기 때문에 선택값이다.
  // 부모가 안 넘기면 undefined가 될 수 있다.
  cardCompany?: string;

  // 카드명 또는 카드별칭
  // 이것도 선택값이다.
  cardName?: string;
}

// 카드 미리보기 컴포넌트
export function CardPreview({
  cardNumber,
  cardCompany,
  cardName,
}: CardPreviewProps) {
  // 화면에 보여줄 카드번호를 만든다.
  const displayCardNumber =
    onlyDigits(cardNumber)
      // 숫자만 남긴 카드번호를 최대 16자리까지만 사용
      .slice(0, 16)

      // 16자리가 안 되면 뒤를 *로 채운다.
      // 예: "1234" -> "1234************"
      .padEnd(16, '*')

      // 4자리마다 하이픈(-)을 붙인다.
      // 예: "1234************" -> "1234-****-****-****"
      .replace(/(.{4})(?=.)/g, '$1-') || '****-****-****-****';

  return (
    // 카드 전체 박스
    // 검정 배경, 둥근 모서리, 내부 여백, 그림자를 적용한다.
    <View className="rounded-2xl bg-zinc-950 p-5 shadow-lg">
      {/* 카드 상단 영역: 왼쪽 카드사명, 오른쪽 카드명 */}
      <View className="flex-row items-start justify-between">
        {/* 카드사명이 있으면 cardCompany 표시, 없으면 기본값 '카드사' 표시 */}
        <Text className="text-sm font-semibold text-zinc-300">
          {cardCompany || '카드사'}
        </Text>

        {/* 카드명이 있으면 cardName 표시, 없으면 기본값 '카드명' 표시 */}
        <Text className="text-sm font-semibold text-emerald-300">
          {cardName || '카드명'}
        </Text>
      </View>

      {/* 카드 IC칩처럼 보이게 만든 장식용 박스 */}
      <View className="mt-8 h-9 w-12 rounded-md bg-amber-300" />

      {/* 카드번호 표시 영역 */}
      <Text className="mt-8 text-xl font-semibold tracking-wider text-white">
        {displayCardNumber}
      </Text>
    </View>
  );
}

// 다른 파일에서 default import로 가져올 수 있게 내보낸다.
export default CardPreview;