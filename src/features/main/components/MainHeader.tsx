import { Image, Pressable, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { Skeleton } from "../../../shared/components/Skeleton";
import { colors } from "../../../shared/styles";

type MainHeaderProps = {
  hasNotification?: boolean;
  isNotificationLoading?: boolean;
  onPressNotification?: () => void;
};

export function MainHeader({
  hasNotification = false,
  isNotificationLoading = false,
  onPressNotification,
}: MainHeaderProps) {
  return (
    <View className="z-10 flex-row items-center justify-between border-b border-neutral-grey1 bg-neutral-white px-5 py-3">
      <Image
        resizeMode="contain"
        source={require("../../../assets/images/erumpay-ci.png")}
        style={{ width: 104, height: 28 }}
      />
      {isNotificationLoading ? (
        <Skeleton width={40} height={40} rounded="full" />
      ) : (
        <Pressable
          accessibilityLabel={hasNotification ? "새 알림이 있는 알림" : "알림"}
          accessibilityRole="button"
          className="relative h-10 w-10 items-center justify-center rounded-full"
          onPress={onPressNotification}
        >
          <BellIcon />
          {hasNotification ? (
            <View className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-state-error" />
          ) : null}
        </Pressable>
      )}
    </View>
  );
}

function BellIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6.5 18H17.5L16.4 16.1V10.9C16.4 8.1 14.6 6.1 12 6.1C9.4 6.1 7.6 8.1 7.6 10.9V16.1L6.5 18Z"
        stroke={colors.neutral.black2}
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
      <Path
        d="M10 19.2C10.4 20.1 11 20.5 12 20.5C13 20.5 13.6 20.1 14 19.2"
        stroke={colors.neutral.black2}
        strokeLinecap="round"
        strokeWidth={1.8}
      />
    </Svg>
  );
}

export default MainHeader;
