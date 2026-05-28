/******************************************************************************
 * File: Accordion.tsx
 * Description: 접고 펼칠 수 있는 공통 아코디언 컴포넌트
 * Worker: [FE] 조보름
 * Created: 2026-05-29
 * Note: 약관, 안내 문구, 상세 정보 영역을 정리하기 위해 생성했습니다.
 ******************************************************************************/

import type { ReactNode } from 'react';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors } from '../../styles';

type AccordionProps = {
  title: string;
  children: ReactNode;
  expanded: boolean;
  onToggle: () => void;
};

function AccordionComponent({
  title,
  children,
  expanded,
  onToggle,
}: AccordionProps) {
  return (
    <View className="overflow-hidden rounded-lg border border-neutral-grey1 bg-neutral-white">
      <Pressable
        accessibilityRole="button"
        className="min-h-[48px] flex-row items-center justify-between gap-3 px-4 py-3"
        onPress={onToggle}
      >
        <Text className="min-w-0 flex-1 font-pretendard text-large-bold text-neutral-black1">
          {title}
        </Text>
        <ChevronIcon expanded={expanded} />
      </Pressable>

      {expanded ? (
        <View className="border-t border-neutral-grey1 px-4 py-3">
          {children}
        </View>
      ) : null}
    </View>
  );
}

export const Accordion = memo(AccordionComponent);

export default Accordion;

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      style={{ transform: [{ rotate: expanded ? '90deg' : '0deg' }] }}
    >
      <Path
        d="M7.5 4.5L12.5 10L7.5 15.5"
        stroke={colors.neutral.black2}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </Svg>
  );
}
