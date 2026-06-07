/******************************************************************************
 * File: FriendListItem.tsx
 * Description: 친구/참여자 목록에서 공통으로 쓰는 사람 정보 행 컴포넌트
 * Worker: [FE] 조보름
 * Created: 2026-06-05
 * Note: 선택 상태, 결제 상태, 메뉴 등 화면별 요소는 slot으로 전달합니다.
 ******************************************************************************/

import type { ReactNode } from 'react';
import { Image, Pressable, Text, View } from 'react-native';

type FriendListItemProps = {
  name: string;
  initial: string;
  phoneSuffix?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  avatarColorClassName?: string;
  leading?: ReactNode;
  badges?: ReactNode;
  nameSuffix?: ReactNode;
  nameRight?: ReactNode;
  right?: ReactNode;
  children?: ReactNode;
  containerClassName?: string;
  avatarWrapperClassName?: string;
  contentClassName?: string;
  nameClassName?: string;
  phoneClassName?: string;
  accessibilityLabel?: string;
  onPress?: () => void;
};

function FriendListItemContent({
  name,
  initial,
  phoneSuffix,
  phoneNumber,
  profileImageUrl,
  avatarColorClassName = 'bg-erum-main',
  leading,
  badges,
  nameSuffix,
  nameRight,
  right,
  children,
  avatarWrapperClassName = '',
  contentClassName = 'ml-3 min-w-0 flex-1',
  nameClassName = 'font-pretendard text-large-bold text-neutral-black1',
  phoneClassName = 'mt-1 font-pretendard text-large-regular text-neutral-black2',
}: FriendListItemProps) {
  return (
    <>
      {leading}

      <View className={avatarWrapperClassName}>
        {profileImageUrl ? (
          <Image
            source={{ uri: profileImageUrl }}
            className="h-12 w-12 rounded-full"
          />
        ) : (
          <View
            className={`h-12 w-12 items-center justify-center rounded-full ${avatarColorClassName}`}
          >
            <Text className="font-pretendard text-large-bold text-neutral-white">
              {initial}
            </Text>
          </View>
        )}
      </View>

      <View className={contentClassName}>
        <View className="flex-row items-center">
          {badges}
          <Text className={nameClassName}>
            {phoneSuffix ? `${name}(${phoneSuffix})` : name}
          </Text>
          {nameSuffix}
          {nameRight}
        </View>

        {phoneNumber ? (
          <Text className={phoneClassName}>
            {phoneNumber}
          </Text>
        ) : null}

        {children}
      </View>

      {right}
    </>
  );
}

export function FriendListItem({
  containerClassName = 'flex-row items-center',
  accessibilityLabel,
  onPress,
  ...props
}: FriendListItemProps) {
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        className={containerClassName}
        onPress={onPress}
      >
        <FriendListItemContent {...props} />
      </Pressable>
    );
  }

  return (
    <View className={containerClassName}>
      <FriendListItemContent {...props} />
    </View>
  );
}

export default FriendListItem;
