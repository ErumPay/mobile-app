import { useEffect, useRef, useState } from "react";
import type {
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { Image, ScrollView, View } from "react-native";

const BANNER_ASPECT_RATIO = 1008 / 426;
const AUTO_SLIDE_INTERVAL_MS = 3500;

export type MainBannerId =
  | "card-recommendation"
  | "dutchpay"
  | "remote-payment";

type MainBannerItem = {
  id: MainBannerId;
  label: string;
  source: ImageSourcePropType;
};

const bannerItems: MainBannerItem[] = [
  {
    id: "card-recommendation",
    label: "카드추천",
    source: require("../../../assets/images/main-banner-card-recommendation.png"),
  },
  {
    id: "dutchpay",
    label: "더치페이",
    source: require("../../../assets/images/main-banner-dutchpay.png"),
  },
  {
    id: "remote-payment",
    label: "원격결제",
    source: require("../../../assets/images/main-banner-remote-payment.png"),
  },
];

export function MainBannerCarousel() {
  const scrollRef = useRef<ScrollView | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [bannerWidth, setBannerWidth] = useState(0);

  useEffect(() => {
    if (bannerWidth <= 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setActiveIndex((currentIndex) => {
        const nextIndex = (currentIndex + 1) % bannerItems.length;
        scrollRef.current?.scrollTo({
          x: nextIndex * bannerWidth,
          animated: true,
        });
        return nextIndex;
      });
    }, AUTO_SLIDE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [bannerWidth]);

  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    if (bannerWidth <= 0) {
      return;
    }

    const nextIndex = Math.round(
      event.nativeEvent.contentOffset.x / bannerWidth,
    );
    setActiveIndex(nextIndex);
  };

  return (
    <View
      className="w-full max-w-[400px] self-center"
      onLayout={(event) => setBannerWidth(event.nativeEvent.layout.width)}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
      >
        {bannerItems.map((item) => (
          <View
            key={item.id}
            style={{
              width: bannerWidth,
              height: bannerWidth / BANNER_ASPECT_RATIO,
            }}
          >
            {bannerWidth > 0 ? (
              <Image
                accessibilityLabel={`${item.label} 배너`}
                resizeMode="contain"
                source={item.source}
                style={{
                  width: bannerWidth,
                  height: bannerWidth / BANNER_ASPECT_RATIO,
                }}
              />
            ) : null}
          </View>
        ))}
      </ScrollView>

      <View className="mt-3 flex-row justify-center gap-1.5">
        {bannerItems.map((item, index) => (
          <View
            key={`${item.id}-dot`}
            className={`h-2 rounded-full ${
              index === activeIndex
                ? "w-2 bg-erum-secondary"
                : "w-2 bg-neutral-grey1"
            }`}
          />
        ))}
      </View>
    </View>
  );
}

export default MainBannerCarousel;
