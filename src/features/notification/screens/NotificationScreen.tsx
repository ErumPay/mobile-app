import { useCallback, useRef, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../../App';
import { fetchNotifications, readNotification, type NotificationItem } from '../api/notificationApi';
import { EmptyState } from '../../../shared/components/EmptyState';
import FloatingButton from '../../../shared/components/FloatingButton/FloatingButton';
import PageWrap from '../../../shared/components/PageWrap';
import Tab from '../../../shared/components/Tab';

const cardImg = require('../../../assets/icons/card.png');
const paymentImg = require('../../../assets/icons/dutch.png');

type NotificationCategory = 'payment' | 'card';
type NotificationFilter = 'all' | NotificationCategory;

type Props = NativeStackScreenProps<RootStackParamList, 'NotificationScreen'>;

const notificationTabs: { label: string; value: NotificationFilter }[] = [
  { label: '전체', value: 'all' },
  { label: '결제', value: 'payment' },
  { label: '카드', value: 'card' },
];

function getNotificationCategory(type: string): NotificationCategory {
  return type.startsWith('CARD') ? 'card' : 'payment';
}

function getNotificationIconSource(type: string) {
  return type.startsWith('CARD') ? cardImg : paymentImg;
}

function formatNotificationDate(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return createdAt;
  }

  return `${String(date.getFullYear()).slice(-2)}/${date.getMonth() + 1}/${date.getDate()}`;
}

function NotificationHeader({ unreadCount, onPressBack }: { unreadCount: number; onPressBack: () => void }) {
  return (
    <View className="w-full flex-row items-center justify-between border-b border-neutral-grey1 bg-neutral-white px-5 py-3">
      <Pressable accessibilityRole="button" className="h-10 w-10 items-center justify-center" onPress={onPressBack}>
        <Feather name="chevron-left" size={28} color="#1D1F1F" />
      </Pressable>

      <View className="min-w-0 flex-1 flex-row items-center justify-center">
        <Text className="font-pretendard text-heading-2 text-neutral-black1">알림</Text>
        <View className="ml-2 h-5 min-w-5 items-center justify-center rounded-full bg-state-error px-1.5">
          <Text className="font-pretendard text-small-bold text-neutral-white">{unreadCount}</Text>
        </View>
      </View>

      <View className="h-10 w-10" />
    </View>
  );
}

const NotificationScreen = ({ navigation }: Props) => {
  const [activeType, setActiveType] = useState<NotificationFilter>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [readingNotificationId, setReadingNotificationId] = useState<number | null>(null);
  const readingNotificationIdsRef = useRef<Set<number>>(new Set());
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const filteredNotifications =
    activeType === 'all'
      ? notifications
      : notifications.filter((item) => getNotificationCategory(item.type) === activeType);

  const handleLoadNotifications = useCallback(async (isActive: () => boolean = () => true) => {
    setIsLoading(true);
    setHasLoadError(false);

    try {
      const response = await fetchNotifications({ page: 0, size: 20 });

      if (!isActive()) {
        return;
      }

      setNotifications(response.items);
    } catch {
      if (isActive()) {
        setNotifications([]);
        setHasLoadError(true);
      }
    } finally {
      if (isActive()) {
        setIsLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      void handleLoadNotifications(() => isActive);

      return () => {
        isActive = false;
      };
    }, [handleLoadNotifications]),
  );

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('MypageHomeScreen');
  };

  const handleChangeBottomNav = (value: string) => {
    if (value === 'home') {
      navigation.navigate('Main');
      return;
    }

    if (value === 'payment') {
      navigation.navigate('QrScan');
      return;
    }

    if (value === 'my') {
      navigation.navigate('MypageHomeScreen');
    }
  };

  const handlePressNotification = async (notification: NotificationItem) => {
    if (notification.isRead) {
      return;
    }

    const notificationId = notification.notificationId;

    if (readingNotificationIdsRef.current.has(notificationId)) {
      return;
    }

    readingNotificationIdsRef.current.add(notificationId);

    try {
      setReadingNotificationId(notificationId);
      const result = await readNotification(notificationId);

      setNotifications((prevNotifications) =>
        prevNotifications.map((item) =>
          item.notificationId === notificationId
            ? { ...item, isRead: result.isRead, readAt: result.readAt }
            : item,
        ),
      );
    } catch {
      // 읽음 처리 실패 시 목록 화면은 그대로 유지합니다.
    } finally {
      readingNotificationIdsRef.current.delete(notificationId);
      setReadingNotificationId((prevNotificationId) =>
        prevNotificationId === notificationId ? null : prevNotificationId,
      );
    }
  };

  return (
    <>
      <PageWrap
        backgroundClassName="bg-neutral-white"
        header={<NotificationHeader unreadCount={unreadCount} onPressBack={handleGoBack} />}
      >
        <View className="gap-4 pb-28">
          <Tab
            items={notificationTabs}
            value={activeType}
            onChange={(value) => setActiveType(value as NotificationFilter)}
          />

          {isLoading ? (
            <View className="rounded-lg border border-neutral-grey1 bg-neutral-white px-4 py-6">
              <Text className="text-center font-pretendard text-large-regular text-neutral-black2">
                알림을 불러오는 중입니다.
              </Text>
            </View>
          ) : filteredNotifications.length > 0 ? (
            <View className="gap-3">
              {filteredNotifications.map((notification) => (
                <Pressable
                  key={notification.notificationId}
                  accessibilityRole="button"
                  className={`rounded-lg border border-neutral-grey1 px-4 py-3 ${
                    notification.isRead ? 'bg-neutral-grey1' : 'bg-neutral-white'
                  }`}
                  onPress={() => void handlePressNotification(notification)}
                >
                  <View className="min-h-[56px] flex-row items-center gap-3 ">
                    <Image
                      source={getNotificationIconSource(notification.type)}
                      style={{ width: 40, height: 40 }}
                      resizeMode="contain"
                    />

                    <View className="min-w-0 flex-1">
                      <Text className="font-pretendard text-large-bold text-neutral-black1">{notification.title}</Text>
                      <Text className="mt-1 font-pretendard text-normal-regular text-neutral-black2">
                        {notification.content}
                      </Text>
                    </View>

                    <Text className="font-pretendard text-normal-regular text-neutral-black2">
                      {formatNotificationDate(notification.createdAt)}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <EmptyState
              title={hasLoadError ? '알림을 불러오지 못했습니다' : '알림이 없습니다'}
              description={hasLoadError ? '잠시 후 다시 시도해주세요.' : '새 알림이 오면 이곳에 표시됩니다.'}
              actionLabel={hasLoadError ? '다시 시도' : undefined}
              onPressAction={hasLoadError ? () => void handleLoadNotifications() : undefined}
            />
          )}
        </View>
      </PageWrap>

      <FloatingButton value="my" onChange={handleChangeBottomNav} />
    </>
  );
};

export default NotificationScreen;
