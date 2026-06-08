/******************************************************************************
 * File: TutorialScreen.tsx
 * Description: 앱 최초 진입 시 노출되는 튜토리얼 스와이프 화면 (TUT_001~004)
 * Worker: [FE] 고민균
 * Created: 2026-06-02
 * Note: 4페이지 캐러셀, 마지막 페이지에서 카카오 로그인 (WebView 방식)
 ******************************************************************************/

import { useCallback, useRef, useState } from 'react';
import {
  Image,
  Modal as RNModal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../../App';
import { Button } from '../../../shared/components/Button';
import { Modal } from '../../../shared/components/Modal';
import {
  KAKAO_AUTH_URL,
  KAKAO_REDIRECT_URI,
  processKakaoAuthCode,
} from '../api/kakaoAuth';
import { setAuthSession } from '../api/authApi';

type TutorialSlide = {
  id: string;
  image: ReturnType<typeof require>;
  title: string;
  description: string;
};

const slides: TutorialSlide[] = [
  {
    id: 'card',
    image: require('../../../assets/images/tutorial-1.png'),
    title: '카드추천',
    description:
      '카드 혜택을 내 소비에 맞게 자동으로 최적화해요.\n실적과 혜택을 나눠 더 똑똑하게 사용할 수 있어요.',
  },
  {
    id: 'dutch',
    image: require('../../../assets/images/tutorial-2.png'),
    title: '더치페이',
    description:
      '복잡한 계산 없이 n분의 1로 간편하게 나눠요.\n각자 금액도 자유롭게 입력해 정확하게 정산할 수 있어요.',
  },
  {
    id: 'remote',
    image: require('../../../assets/images/tutorial-3.png'),
    title: '원격결제',
    description:
      '함께 있지 않아도 결제가 가능해요.\n요청만 보내면 상대가 어디서든 바로 결제할 수 있어요.',
  },
  {
    id: 'start',
    image: require('../../../assets/images/tutorial-4.png'),
    title: '',
    description: '지금 바로 시작하고,\n스마트한 결제를 경험해보세요.',
  },
];

type Props = NativeStackScreenProps<RootStackParamList, 'Tutorial'>;

function getUrlQueryParam(url: string, key: string) {
  const queryString = url.split('?')[1]?.split('#')[0];
  if (!queryString) return null;

  for (const part of queryString.split('&')) {
    const [rawKey, rawValue = ''] = part.split('=');
    if (decodeURIComponent(rawKey) === key) {
      return decodeURIComponent(rawValue.replace(/\+/g, ' '));
    }
  }

  return null;
}

export default function TutorialScreen({ navigation }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
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

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showKakaoWebView, setShowKakaoWebView] = useState(false);
  const authFlowRef = useRef<'signup' | 'login'>('signup');
  const isProcessingRef = useRef(false);
  const [alertModal, setAlertModal] = useState<{
    visible: boolean;
    title: string;
    description?: string;
    icon: 'warning' | 'error';
    onConfirmAction?: () => void;
  }>({ visible: false, title: '', icon: 'warning' });

  const handleSignup = () => {
    if (showKakaoWebView || isLoggingIn) return;
    authFlowRef.current = 'signup';
    isProcessingRef.current = false;
    setShowKakaoWebView(true);
  };

  const handleLogin = () => {
    if (showKakaoWebView || isLoggingIn) return;
    authFlowRef.current = 'login';
    isProcessingRef.current = false;
    setShowKakaoWebView(true);
  };

  const handleWebViewNavigation = (url: string) => {
    if (!url.startsWith(KAKAO_REDIRECT_URI)) return;
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setShowKakaoWebView(false);

    try {
      const code = getUrlQueryParam(url, 'code');
      const error = getUrlQueryParam(url, 'error');

      if (error) {
        isProcessingRef.current = false;
        return;
      }

      if (code) {
        processLogin(code);
      } else {
        isProcessingRef.current = false;
      }
    } catch {
      isProcessingRef.current = false;
      setAlertModal({
        visible: true,
        title: '로그인에 실패했습니다.',
        description: 'URL 파싱에 실패했습니다.',
        icon: 'error',
      });
    }
  };

  const processLogin = async (code: string) => {
    setIsLoggingIn(true);
    try {
      const result = await processKakaoAuthCode(code);
      if (!Number.isFinite(result.userId)) {
        throw new Error('로그인 사용자 정보를 확인할 수 없습니다.');
      }

      setAuthSession(result.accessToken, result.refreshToken, result.userId);
      const flow = authFlowRef.current;
      const isSignupIncomplete = result.newUser || result.status === 'PENDING';
      if (flow === 'signup') {
        if (isSignupIncomplete) {
          navigation.navigate('TermsAgreement', { accessToken: result.accessToken });
        } else {
          setAlertModal({
            visible: true,
            title: '이미 가입된 계정입니다.',
            description: '카카오톡으로 로그인해주세요.',
            icon: 'warning',
          });
        }
      } else {
        if (isSignupIncomplete) {
          setAlertModal({
            visible: true,
            title: '가입되지 않은 계정입니다.',
            description: '회원가입을 먼저 진행해주세요.',
            icon: 'warning',
            onConfirmAction: () => {
              navigation.navigate('TermsAgreement', { accessToken: result.accessToken });
            },
          });
        } else {
          navigation.navigate('Main');
        }
      }
    } catch (err) {
      setAlertModal({
        visible: true,
        title: '로그인에 실패했습니다.',
        description: err instanceof Error ? err.message : '카카오 로그인에 실패했습니다.',
        icon: 'error',
      });
    } finally {
      setIsLoggingIn(false);
      isProcessingRef.current = false;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-neutral-white">
      <View className="flex-1">
        {/* 건너뛰기 (마지막 슬라이드에서는 숨김) */}
        <View className="flex-row justify-end px-5 py-2">
          {!isLastSlide ? (
            <Pressable
              onPress={() => goTo(slides.length - 1)}
              className="flex-row items-center py-2"
            >
              <Text className="font-pretendard text-normal-bold text-neutral-black2">
                건너뛰기
              </Text>
              <Text className="ml-1 font-pretendard text-normal-bold text-neutral-black2">
                →
              </Text>
            </Pressable>
          ) : (
            <View className="py-2" style={{ height: 36 }} />
          )}
        </View>

        {/* 상단 고정 로고 */}
        <View className="items-center mb-4">
          <Image
            source={require('../../../assets/images/erumpay-ci.png')}
            style={{ width: 140, height: 40 }}
            resizeMode="contain"
          />
        </View>

        {/* 스와이프 영역 (이미지 + 텍스트만) */}
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
              {/* 일러스트 이미지 */}
              <View className="flex-1 items-center justify-center px-8">
                <Image
                  source={slide.image}
                  style={{
                    width: Math.min(screenWidth * 1.05, 440),
                    height: Math.min(screenWidth * 1.05, 440),
                  }}
                  resizeMode="contain"
                />
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
          <View className="w-full px-8 pb-8 gap-3">
            <Button
              label={isLoggingIn && authFlowRef.current === 'signup' ? '처리 중...' : '회원가입'}
              variant="primary"
              size="large"
              disabled={isLoggingIn}
              onPress={handleSignup}
            />
            <Button
              label={isLoggingIn && authFlowRef.current === 'login' ? '로그인 중...' : '카카오톡으로 로그인'}
              variant="secondary"
              size="large"
              disabled={isLoggingIn}
              onPress={handleLogin}
            />
          </View>
        ) : (
          <View className="w-full px-8 pb-8">
            <Button
              label="다음"
              variant="secondary"
              size="large"
              onPress={() => goTo(currentIndex + 1)}
            />
          </View>
        )}
      </View>

      {/* 카카오 로그인 WebView 모달 */}
      <RNModal
        visible={showKakaoWebView}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowKakaoWebView(false)}
      >
        <View
          className="bg-neutral-white"
          style={{
            flex: 1,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          }}
        >
          <View className="flex-row items-center justify-between px-4 py-3">
            <Text className="font-pretendard text-heading-3 text-neutral-black1">
              카카오 로그인
            </Text>
            <Pressable onPress={() => setShowKakaoWebView(false)}>
              <Text className="font-pretendard text-large-regular text-neutral-disabled">
                닫기
              </Text>
            </Pressable>
          </View>
          <WebView
            source={{ uri: KAKAO_AUTH_URL }}
            onShouldStartLoadWithRequest={(request) => {
              if (request.url.startsWith(KAKAO_REDIRECT_URI)) {
                handleWebViewNavigation(request.url);
                return false;
              }
              return true;
            }}
            onNavigationStateChange={(navState) => {
              if (!navState.loading && navState.url.startsWith(KAKAO_REDIRECT_URI)) {
                handleWebViewNavigation(navState.url);
              }
            }}
            javaScriptEnabled
            domStorageEnabled
          />
        </View>
      </RNModal>

      {/* 안내 모달 */}
      <Modal
        visible={alertModal.visible}
        type="one"
        icon={
          <View
            className={`h-14 w-14 items-center justify-center rounded-full ${
              alertModal.icon === 'error' ? 'bg-state-error' : 'bg-[#FF9500]'
            }`}
          >
            <Feather
              name={alertModal.icon === 'error' ? 'x' : 'alert-triangle'}
              size={30}
              color="#FFFFFF"
            />
          </View>
        }
        title={alertModal.title}
        description={alertModal.description}
        confirmLabel="확인"
        onConfirm={() => {
          const action = alertModal.onConfirmAction;
          setAlertModal((prev) => ({ ...prev, visible: false, onConfirmAction: undefined }));
          action?.();
        }}
        onClose={() => setAlertModal((prev) => ({ ...prev, visible: false, onConfirmAction: undefined }))}
      />
    </SafeAreaView>
  );
}
