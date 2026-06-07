import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { Header } from '../../../shared/components/Header';
import { NoticeBox } from '../../../shared/components/NoticeBox';
import { PageWrap } from '../../../shared/components/PageWrap';
import { colors } from '../../../shared/styles';

interface CardRegisterMethodSelectScreenProps {
  onClose: () => void;
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
            tone="scan"
            title="카드 스캔하기"
            description="카드를 촬영해주세요"
            onPress={onPressOcr}
          />

          <RegisterMethodCard
            tone="manual"
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
  tone: 'scan' | 'manual';
  title: string;
  description: string;
  onPress: () => void;
}) {
  const isScan = tone === 'scan';
  const iconName = isScan ? 'camera' : 'edit-3';
  const iconColor = colors.neutral.white;
  const iconBackgroundColor = isScan ? '#3569A8' : colors.erum.secondary;
  const cardBorderColor = isScan ? '#3569A8' : colors.erum.secondary;
  const cardBackgroundColor = isScan ? '#F5FAFF' : '#F5FFFB';

  return (
    <Pressable
      accessibilityRole="button"
      className="w-full items-center justify-center rounded-2xl border-2 px-5 py-6"
      style={{
        backgroundColor: cardBackgroundColor,
        borderColor: cardBorderColor,
      }}
      onPress={onPress}
    >
      <View
        className="mb-5 h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: iconBackgroundColor }}
      >
        <Feather name={iconName} size={30} color={iconColor} />
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

export default CardRegisterMethodSelectScreen;
