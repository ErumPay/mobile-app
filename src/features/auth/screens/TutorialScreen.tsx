/******************************************************************************
 * File: TutorialScreen.tsx
 * Description: 앱 최초 진입 시 노출되는 튜토리얼 스와이프 화면 (TUT_001~004)
 * Worker: [FE] 고민균
 * Created: 2026-06-02
 * Note: 4페이지 캐러셀, 마지막 페이지에서 회원가입/로그인 분기
 ******************************************************************************/

import { useCallback, useRef, useState } from 'react';
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../../App';
import { Button } from '../../../shared/components/Button';

type TutorialSlide = {
  id: string;
  image: ReturnType<typeof require> | null;
  title: string;
  description: string;
};

const slides: TutorialSlide[] = [
  {
    id: 'card',
    image: require('../../../assets/images/main-banner-card-recommendation.png'),
    title: '카드추천',
    description:
      '카드 혜택을 내 소비에 맞게 자동으로 최적화해요.\n실적과 혜택을 나눠 더 똑똑하게 사용할 수 있어요.',
  },
  {
    id: 'dutch',
    image: require('../../../assets/images/main-banner-dutchpay.png'),
    title: '더치페이',
    description:
      '복잡한 계산 없이 n분의 1로 간편하게 나눠요.\n각자 금액도 자유롭게 입력해 정확하게 정산할 수 있어요.',
  },
  {
    id: 'remote',
    image: require('../../../assets/images/main-banner-remote-payment.png'),
    title: '원격결제',
    description:
      '함께 있지 않아도 결제가 가능해요.\n요청만 보내면 상대가 어디서든 바로 결제할 수 있어요.',
  },
  {
    id: 'start',
    image: null,
    title: '',
    description: '지금 바로 시작하고,\n스마트한 결제를 경험해보세요.',
  },
];

type Props = NativeStackScreenProps<RootStackParamList, 'Tutorial'>;

export default function TutorialScreen({ navigation }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width: screenWidth } = useWindowDimensions();
  const scrollViewRef = useRef<ScrollView>(null);

  const isLastSlide = currentIndex === slides.length - 1;

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / screenWidth);
      if (index >= 0 && index < slides.length) {
        setCurrentIndex(index);
      }
    },
    [screenWidth],
  );

  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(index, slides.length - 1));
    scrollViewRef.current?.scrollTo({ x: clamped * screenWidth, animated: true });
    setCurrentIndex(clamped);
  };

  const handleSignup = () => {
    navigation.navigate('TermsAgreement');
  };

  const handleLogin = () => {
    // TODO: 카카오 로그인 후 기존 회원이면 Main, 신규면 회원가입 프로세스
    navigation.navigate('Main');
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-neutral-white">
      <View className="flex-1">
        {/* 스와이프 영역 */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          className="flex-1"
        >
          {slides.map((slide) => (
            <View
              key={slide.id}
              style={{ width: screenWidth }}
              className="flex-1 items-center"
            >
              {/* 상단 로고 */}
              <View className="mt-12 mb-4">
                <Image
                  source={require('../../../assets/images/erumpay-ci.png')}
                  style={{ width: 140, height: 40 }}
                  resizeMode="contain"
                />
              </View>

              {/* 일러스트 이미지 */}
              <View className="flex-1 items-center justify-center px-8">
                {slide.image ? (
                  <Image
                    source={slide.image}
                    style={{
                      width: Math.min(screenWidth * 0.7, 300),
                      height: Math.min(screenWidth * 0.7, 300),
                    }}
                    resizeMode="contain"
                  />
                ) : (
                  <Image
                    source={require('../../../assets/images/erumpay-ci.png')}
                    style={{ width: 200, height: 60 }}
                    resizeMode="contain"
                  />
                )}
              </View>

              {/* 텍스트 영역 */}
              <View className="w-full px-8 pb-4">
                {slide.title !== '' && (
                  <Text className="mb-2 text-center font-pretendard text-heading-2 text-neutral-black1">
                    {slide.title}
                  </Text>
                )}
                <Text className="text-center font-pretendard text-large-regular text-neutral-black2 leading-6">
                  {slide.description}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* 인디케이터 */}
        <View className="flex-row items-center justify-center gap-2 py-4">
          {slides.map((_, dotIndex) => (
            <Pressable key={dotIndex} onPress={() => goTo(dotIndex)}>
              <View
                className={`h-2 rounded-full ${
                  dotIndex === currentIndex
                    ? 'w-5 bg-erum-main'
                    : 'w-2 bg-neutral-disabled'
                }`}
              />
            </Pressable>
          ))}
        </View>

        {/* 하단 버튼 영역 */}
        {isLastSlide ? (
          <View className="w-full gap-3 px-8 pb-10">
            <Button
              label="회원가입"
              variant="primary"
              size="large"
              onPress={handleSignup}
            />
            <Button
              label="카카오톡으로 로그인"
              variant="secondary"
              size="large"
              onPress={handleLogin}
            />
          </View>
        ) : (
          <View className="w-full px-8 pb-10">
            <Pressable
              onPress={() => goTo(slides.length - 1)}
              className="items-center py-3"
            >
              <Text className="font-pretendard text-large-regular text-neutral-disabled underline">
                튜토리얼 건너뛰기
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
