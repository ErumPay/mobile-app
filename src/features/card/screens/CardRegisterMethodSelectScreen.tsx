import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Header } from '../../../shared/components/Header';
import { NoticeBox } from '../../../shared/components/NoticeBox';
import { PageWrap } from '../../../shared/components/PageWrap';

interface CardRegisterMethodSelectScreenProps {
  onClose?: () => void;
  onPressOcr: () => void;
  onPressManual: () => void;
}

export function CardRegisterMethodSelectScreen({
  onClose,
  onPressOcr,
  onPressManual,
}: CardRegisterMethodSelectScreenProps) {
  return (
    <PageWrap
      backgroundClassName="bg-neutral-grey2"
      header={<Header title="카드등록" type="close" onPressRight={onClose} />}
    >
      <View className="w-full gap-6">
        <Text className="font-pretendard text-heading-2 text-neutral-black1">
          카드 등록 방법을 선택해주세요.
        </Text>

        <View className="gap-4">
          <RegisterMethodCard
            tone="blue"
            title="OCR로 등록하기"
            description="카드를 촬영해주세요"
            onPress={onPressOcr}
          />

          <RegisterMethodCard
            tone="green"
            title="직접 입력하기"
            description="카드 정보를 직접 입력해주세요"
            onPress={onPressManual}
          />
        </View>

        <NoticeBox
          tone="info"
          description="카드 등록 시 카드사 확인 절차가 진행됩니다. 본인 명의의 카드만 등록 가능합니다."
        />
      </View>
    </PageWrap>
  );
}

function RegisterMethodCard({
  tone,
  title,
  description,
  onPress,
}: {
  tone: 'blue' | 'green';
  title: string;
  description: string;
  onPress: () => void;
}) {
  const isBlue = tone === 'blue';
  const borderClassName = isBlue ? 'border-blue-700' : 'border-erum-secondary';
  const iconClassName = isBlue ? 'bg-blue-700' : 'bg-erum-secondary';

  return (
    <Pressable
      accessibilityRole="button"
      className={`w-full items-center justify-center rounded-2xl border-2 bg-neutral-white px-5 py-6 ${borderClassName}`}
      onPress={onPress}
    >
      <View
        className={`mb-5 h-16 w-16 items-center justify-center rounded-full ${iconClassName}`}
      >
        {isBlue ? <CameraIcon /> : <PencilIcon />}
      </View>

      <Text className="font-pretendard text-heading-2 text-neutral-black1">
        {title}
      </Text>

      <Text className="mt-3 text-center font-pretendard text-heading-3 text-neutral-black2">
        {description}
      </Text>
    </Pressable>
  );
}

function CameraIcon() {
  return (
    <Svg width={34} height={30} viewBox="0 0 46 40" fill="none">
      <Rect
        x={7}
        y={13}
        width={32}
        height={22}
        rx={3}
        stroke="white"
        strokeWidth={3.5}
      />
      <Circle cx={23} cy={24} r={6} stroke="white" strokeWidth={3.5} />
      <Path
        d="M16 13L20 8H26L30 13"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3.5}
      />
    </Svg>
  );
}

function PencilIcon() {
  return (
    <Svg width={34} height={34} viewBox="0 0 46 46" fill="none">
      <Path
        d="M31 8L38 15L18 35L9 37L11 28L31 8Z"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={4}
      />
      <Path
        d="M28 12L35 19"
        stroke="white"
        strokeLinecap="round"
        strokeWidth={4}
      />
      <Path
        d="M18 37H36"
        stroke="white"
        strokeLinecap="round"
        strokeWidth={4}
      />
    </Svg>
  );
}

export default CardRegisterMethodSelectScreen;
