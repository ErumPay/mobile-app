import { useState } from 'react';
import { Image, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../../App';
import { EmptyState } from '../../../shared/components/EmptyState';
import FloatingButton from '../../../shared/components/FloatingButton/FloatingButton';
import Header from '../../../shared/components/Header';
import PageWrap from '../../../shared/components/PageWrap';
import Tab from '../../../shared/components/Tab';

const cardImg = require('../../../assets/icons/card.png');
const paymentImg = require('../../../assets/icons/dutch.png');

type NotificationCategory = 'payment' | 'card';
type NotificationFilter = 'all' | NotificationCategory;

type Props = NativeStackScreenProps<RootStackParamList, 'NotificationScreen'>;

type NotificationItem = {
  notificationId: number;
  type: string;
  title: string;
  content: string;
  paymentId: number | null;
  isRead: boolean;
  channel: string;
  createdAt: string;
  readAt: string | null;
};

type NotificationResponse = {
  page: number;
  size: number;
  totalCount: number;
  items: NotificationItem[];
};

const notificationResponse: NotificationResponse = {
  page: 0,
  size: 20,
  totalCount: 2,
  items: [
    {
      notificationId: 1001,
      type: 'PAYMENT_DONE',
      title: '결제가 완료되었습니다.',
      content: '45,000원 결제가 완료되었습니다.',
      paymentId: 90001,
      isRead: false,
      channel: 'IN_APP',
      createdAt: '2026-05-12T10:00:05',
      readAt: null,
    },
    {
      notificationId: 1002,
      type: 'CARD_REGISTERED',
      title: '카드가 등록되었습니다.',
      content: '카드 등록이 완료되었습니다.',
      paymentId: null,
      isRead: true,
      channel: 'IN_APP',
      createdAt: '2026-05-12T09:30:00',
      readAt: '2026-05-12T09:31:00',
    },
    {
      notificationId: 1004,
      type: 'DUTCH',
      title: '더치페이 요청이 왔습니다.',
      content: '더치페이에 참여해주세요.',
      paymentId: null,
      isRead: true,
      channel: 'IN_APP',
      createdAt: '2026-05-12T09:30:00',
      readAt: '2026-05-12T09:31:00',
    },
  ],
};

const notificationTabs: { label: string; value: NotificationFilter }[] = [
  { label: '전체', value: 'all' },
  { label: '결제', value: 'payment' },
  { label: '카드', value: 'card' },
];

function getNotificationCategory(type: string): NotificationCategory {
  return type.startsWith('CARD_') ? 'card' : 'payment';
}

function getNotificationIconSource(type: string) {
  return type.startsWith('CARD_') ? cardImg : paymentImg;
}

function formatNotificationDate(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return createdAt;
  }

  return `${date.getMonth() + 1}/${date.getDate()}`;
}

const NotificationScreen = ({ navigation }: Props) => {
  const [activeType, setActiveType] = useState<NotificationFilter>('all');
  const notifications = notificationResponse.items;

  const filteredNotifications =
    activeType === 'all'
      ? notifications
      : notifications.filter((item) => getNotificationCategory(item.type) === activeType);

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
      navigation.navigate('PaymentMethodSelect');
      return;
    }

    if (value === 'my') {
      navigation.navigate('MypageHomeScreen');
    }
  };

  return (
    <>
      <PageWrap
        backgroundClassName="bg-neutral-grey2"
        header={<Header title="알림" type="back" onPressLeft={handleGoBack} />}
      >
        <View className="gap-4 pb-28">
          <Tab
            items={notificationTabs}
            value={activeType}
            onChange={(value) => setActiveType(value as NotificationFilter)}
          />

          <View className="gap-3">
            {filteredNotifications.map((notification) => (
              <View
                key={notification.notificationId}
                className={`rounded-lg px-4 py-3 ${notification.isRead ? 'bg-neutral-white' : 'bg-neutral-grey1'}`}
              >
                <View className="min-h-[56px] flex-row items-center gap-3">
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
              </View>
            ))}
          </View>

          {filteredNotifications.length === 0 ? (
            <EmptyState title="알림이 없습니다" description="새 알림이 오면 이곳에 표시됩니다." />
          ) : null}
        </View>
      </PageWrap>

      <FloatingButton value="my" onChange={handleChangeBottomNav} />
    </>
  );
};

export default NotificationScreen;
