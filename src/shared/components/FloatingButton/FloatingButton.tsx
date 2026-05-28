/******************************************************************************
 * File: FloatingButton.tsx
 * Description: 앱 하단에 고정 노출되는 공통 플로팅 내비게이션 컴포넌트
 * Worker: [FE] 조보름
 * Created: 2026-05-29
 * Note: 홈/결제/MY 진입을 제공하는 앱 서비스용 플로팅 버튼입니다.
 ******************************************************************************/

import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type FloatingButtonItem = {
  label: string;
  value: string;
  icon: 'home' | 'payment' | 'my';
};

type FloatingButtonProps = {
  items?: FloatingButtonItem[];
  value?: string;
  onChange?: (value: string) => void;
};

const defaultItems: FloatingButtonItem[] = [
  { label: '홈', value: 'home', icon: 'home' },
  { label: '결제', value: 'payment', icon: 'payment' },
  { label: 'MY', value: 'my', icon: 'my' },
];

export function FloatingButton({
  items = defaultItems,
  value = 'payment',
  onChange,
}: FloatingButtonProps) {
  return (
    <View className="absolute bottom-6 left-7 right-7">
      <View className="min-h-[92px] flex-row items-center justify-between rounded-full bg-neutral-white px-7 shadow-sm">
        {items.map((item) => {
          const isSelected = item.value === value;
          const iconColor = isSelected ? '#FFFFFF' : '#4B5057';

          return (
            <Pressable
              key={item.value}
              accessibilityRole="button"
              className="min-w-[72px] items-center justify-center"
              onPress={() => onChange?.(item.value)}
            >
              <View
                className={`items-center justify-center rounded-full ${
                  isSelected
                    ? '-mt-11 h-[76px] w-[76px] bg-[#2F5F9E] shadow-sm'
                    : 'h-[56px] w-[56px] bg-neutral-grey2'
                }`}
              >
                <FloatingNavIcon color={iconColor} name={item.icon} />
              </View>
              <Text
                className={`mt-2 font-pretendard text-large-bold ${
                  isSelected ? 'text-[#2F5F9E]' : 'text-neutral-black2'
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default FloatingButton;

function FloatingNavIcon({
  color,
  name,
}: {
  color: string;
  name: FloatingButtonItem['icon'];
}) {
  if (name === 'home') {
    return (
      <Svg width={30} height={30} viewBox="0 0 30 30" fill="none">
        <Path
          d="M5 14.2L15 5.5L25 14.2V25H18.5V18.2H11.5V25H5V14.2Z"
          stroke={color}
          strokeLinejoin="round"
          strokeWidth={2.4}
        />
      </Svg>
    );
  }

  if (name === 'my') {
    return (
      <Svg width={30} height={30} viewBox="0 0 30 30" fill="none">
        <Circle cx={15} cy={10.5} r={4.5} stroke={color} strokeWidth={2.4} />
        <Path
          d="M7.5 25C8.2 20.9 11 18.8 15 18.8C19 18.8 21.8 20.9 22.5 25"
          stroke={color}
          strokeLinecap="round"
          strokeWidth={2.4}
        />
      </Svg>
    );
  }

  return (
    <Svg width={34} height={34} viewBox="0 0 34 34" fill="none">
      <Rect x={5} y={5} width={8} height={8} rx={2} stroke={color} strokeWidth={2.8} />
      <Rect x={21} y={5} width={8} height={8} rx={2} stroke={color} strokeWidth={2.8} />
      <Rect x={5} y={21} width={8} height={8} rx={2} stroke={color} strokeWidth={2.8} />
      <Rect x={21} y={21} width={8} height={8} rx={2} stroke={color} strokeWidth={2.8} />
      <Circle cx={17} cy={17} r={2.2} fill={color} />
    </Svg>
  );
}
