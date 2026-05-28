/******************************************************************************
 * File: GuideScreen.tsx
 * Description: 개발/퍼블리싱 확인용 IA 및 공통 컴포넌트 가이드 화면
 * Worker: [FE] 조보름
 * Created: 2026-05-29
 * Note: 운영 사용자 플로우가 아닌 내부 확인용 화면입니다.
 ******************************************************************************/

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import type { RootStackParamList } from '../../../App';
import { BottomSheet } from '../../shared/components/BottomSheet';
import { ErrorPage } from '../../shared/components/ErrorPage';
import { Toast } from '../../shared/components/Toast';
import { colors } from '../../shared/styles';

type GuideStatus = 'done' | 'progress' | 'planned';

type GuidePage = {
  depth1: string;
  depth2: string;
  pageName: string;
  routeName: string;
  route?: keyof RootStackParamList;
  status: GuideStatus;
  note?: string;
};

type ComponentGuideItem = {
  name: string;
  path: string;
  status: GuideStatus;
  preview?: 'errorPage' | 'bottomSheet' | 'toast';
  note?: string;
};

const guidePages: GuidePage[] = [
  {
    depth1: 'app',
    depth2: 'main',
    pageName: '메인',
    routeName: 'Main',
    route: 'Main',
    status: 'done',
  },
  {
    depth1: 'card',
    depth2: 'register',
    pageName: '카드 등록',
    routeName: 'CardManualRegister',
    route: 'CardManualRegister',
    status: 'done',
  },
  {
    depth1: 'payment',
    depth2: 'method-select',
    pageName: '카드결제 결제수단 선택',
    routeName: 'PaymentMethodSelect',
    status: 'planned',
    note: 'KAN-1151 작업 예정',
  },
  {
    depth1: 'guide',
    depth2: 'ia',
    pageName: 'IA/컴포넌트 가이드',
    routeName: 'Guide',
    route: 'Guide',
    status: 'progress',
  },
];

const componentGuideItems: ComponentGuideItem[] = [
  {
    name: 'ErrorPage',
    path: 'src/shared/components/ErrorPage',
    status: 'done',
    preview: 'errorPage',
    note: '404/500',
  },
  {
    name: 'BottomSheet',
    path: 'src/shared/components/BottomSheet',
    status: 'done',
    preview: 'bottomSheet',
  },
  {
    name: 'Toast',
    path: 'src/shared/components/Toast',
    status: 'done',
    preview: 'toast',
  },
  {
    name: 'Header',
    path: 'src/shared/components/Header',
    status: 'planned',
  },
  {
    name: 'Button',
    path: 'src/shared/components/Button',
    status: 'planned',
  },
  {
    name: 'Tab',
    path: 'src/shared/components/Tab',
    status: 'planned',
  },
  {
    name: 'Toggle',
    path: 'src/shared/components/Toggle',
    status: 'planned',
  },
  {
    name: 'Accordion',
    path: 'src/shared/components/Accordion',
    status: 'planned',
  },
  {
    name: 'PageWrap',
    path: 'src/shared/components/PageWrap',
    status: 'planned',
    note: '모바일/태블릿 공통 wrap',
  },
];

const statusLabel: Record<GuideStatus, string> = {
  done: '완료',
  progress: '진행중',
  planned: '예정',
};

const statusClassName: Record<GuideStatus, string> = {
  done: 'bg-state-success',
  progress: 'bg-erum-main',
  planned: 'bg-neutral-black2',
};

const colorGroups = [
  {
    title: 'Main',
    items: [
      { name: 'Main', value: colors.erum.main },
      { name: 'Secondary', value: colors.erum.secondary },
      { name: 'Primary', value: colors.erum.primary },
    ],
  },
  {
    title: 'State',
    items: [
      { name: 'Gold', value: colors.state.gold },
      { name: 'Silver', value: colors.state.silver },
      { name: 'Error', value: colors.state.error },
      { name: 'Success', value: colors.state.success },
      { name: 'Orange', value: colors.state.orange },
      { name: 'Sky', value: colors.state.sky },
    ],
  },
  {
    title: 'Neutral',
    items: [
      { name: 'Black 1', value: colors.neutral.black1 },
      { name: 'Black 2', value: colors.neutral.black2 },
      { name: 'Grey 1', value: colors.neutral.grey1 },
      { name: 'Grey 2', value: colors.neutral.grey2 },
      { name: 'White', value: colors.neutral.white },
    ],
  },
];

const typographyItems = [
  { name: 'Heading 1', className: 'text-heading-1', spec: '36 / 43' },
  { name: 'Heading 2', className: 'text-heading-2', spec: '24 / 29' },
  { name: 'Heading 3', className: 'text-heading-3', spec: '16 / 19' },
  { name: 'Large Bold', className: 'text-large-bold', spec: '15 / 21' },
  { name: 'Large Regular', className: 'text-large-regular', spec: '15 / 21' },
  { name: 'Normal Bold', className: 'text-normal-bold', spec: '12 / 14' },
  { name: 'Normal Regular', className: 'text-normal-regular', spec: '12 / 14' },
];

type Props = NativeStackScreenProps<RootStackParamList, 'Guide'>;

export default function GuideScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const horizontalPadding = 20;
  const contentWidth = Math.max(0, Math.min(width - horizontalPadding * 2, 720));
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isErrorPreviewVisible, setIsErrorPreviewVisible] = useState(false);

  const handlePressComponentPreview = (
    preview: ComponentGuideItem['preview'],
  ) => {
    if (preview === 'bottomSheet') {
      setIsBottomSheetVisible(true);
      return;
    }

    if (preview === 'toast') {
      setIsToastVisible(true);
      setTimeout(() => {
        setIsToastVisible(false);
      }, 1800);
      return;
    }

    if (preview === 'errorPage') {
      setIsErrorPreviewVisible(true);
    }
  };

  return (
    <View className="flex-1">
      {isErrorPreviewVisible ? (
        <ErrorPage
          variant="notFound"
          actionLabel="가이드로 돌아가기"
          onPressAction={() => setIsErrorPreviewVisible(false)}
        />
      ) : (
        <ScrollView className="flex-1 bg-neutral-grey2">
          <View className="w-full items-center px-5 py-6">
            <View style={{ width: contentWidth }} className="gap-5">
          <GuideSection title="CI">
            <View className="rounded-xl border border-neutral-grey1 bg-neutral-white p-4">
              <Image
                resizeMode="contain"
                source={require('../../assets/images/erumpay-ci.png')}
                style={{ width: '100%', height: 120 }}
              />
            </View>
          </GuideSection>

          <GuideSection title="Grid">
            <View className="gap-3 rounded-xl border border-neutral-grey1 bg-neutral-white p-4">
              <Image
                resizeMode="contain"
                source={require('../../assets/images/erumpay-grid.png')}
                style={{ width: '100%', height: 190 }}
              />
              <GuideGridRow label="Mobile" value="360 ~ 767 / 6 columns / gap 12" />
              <GuideGridRow label="Tablet" value="768 ~ 1200 / 6 columns / gap 12" />
            </View>
          </GuideSection>

          <GuideSection title="IA">
            <View className="gap-2">
              {guidePages.map((page) => (
                <GuideListRow
                  key={`${page.depth1}-${page.depth2}-${page.routeName}`}
                  status={page.status}
                  title={`${page.depth1} / ${page.depth2}`}
                  description={`${page.pageName} · ${page.routeName}`}
                  note={page.note}
                  onPress={
                    page.status === 'done' && page.route
                      ? () => {
                          if (page.route === 'Main') {
                            navigation.navigate('Main');
                            return;
                          }

                          if (page.route === 'CardManualRegister') {
                            navigation.navigate('CardManualRegister');
                          }
                        }
                      : undefined
                  }
                />
              ))}
            </View>
          </GuideSection>

          <GuideSection title="Colors">
            <View className="gap-4 rounded-xl border border-neutral-grey1 bg-neutral-white p-4">
              {colorGroups.map((group) => (
                <View key={group.title}>
                  <Text className="mb-2 font-pretendard text-heading-3 text-neutral-black1">
                    {group.title}
                  </Text>
                  <View className="flex-row flex-wrap gap-3">
                    {group.items.map((item) => (
                      <View key={`${group.title}-${item.name}`} className="w-[92px]">
                        <View
                          style={{ backgroundColor: item.value }}
                          className="mb-2 h-12 rounded-lg border border-neutral-grey1"
                        />
                        <Text className="font-pretendard text-normal-bold text-neutral-black1">
                          {item.name}
                        </Text>
                        <Text className="font-pretendard text-normal-regular text-neutral-black2">
                          {item.value}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </GuideSection>

          <GuideSection title="Typography">
            <View className="gap-3 rounded-xl border border-neutral-grey1 bg-neutral-white p-4">
              {typographyItems.map((item) => (
                <View
                  key={item.name}
                  className="flex-row items-center justify-between gap-4"
                >
                  <Text
                    className={`min-w-0 flex-1 font-pretendard text-erum-secondary ${item.className}`}
                  >
                    {item.name}
                  </Text>
                  <Text className="font-pretendard text-normal-regular text-neutral-black2">
                    {item.spec}
                  </Text>
                </View>
              ))}
            </View>
          </GuideSection>

              <GuideSection title="Components">
                <View className="gap-2">
                  {componentGuideItems.map((item) => (
                    <GuideListRow
                      key={item.name}
                      status={item.status}
                      title={item.name}
                      description={item.path}
                      note={item.note}
                      onPress={
                        item.status === 'done' && item.preview
                          ? () => handlePressComponentPreview(item.preview)
                          : undefined
                      }
                    />
                  ))}
                </View>
              </GuideSection>
            </View>
          </View>
        </ScrollView>
      )}

      <BottomSheet
        title="BottomSheet Preview"
        visible={isBottomSheetVisible}
        onClose={() => setIsBottomSheetVisible(false)}
      >
        <View className="gap-3">
          <Text className="font-pretendard text-large-bold text-neutral-black1">
            바텀시트 샘플입니다.
          </Text>
          <Text className="font-pretendard text-large-regular text-neutral-black2">
            닫기 버튼이나 배경 영역을 눌러 닫을 수 있어요.
          </Text>
        </View>
      </BottomSheet>

      <Toast
        visible={isToastVisible}
        message="토스트 샘플입니다."
        type="success"
      />
    </View>
  );
}

function GuideSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View>
      <Text className="mb-3 font-pretendard text-heading-2 text-neutral-black1">
        {title}
      </Text>
      {children}
    </View>
  );
}

function GuideGridRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between gap-4">
      <Text className="font-pretendard text-large-bold text-neutral-black1">
        {label}
      </Text>
      <Text className="min-w-0 flex-1 text-right font-pretendard text-large-regular text-neutral-black2">
        {value}
      </Text>
    </View>
  );
}

function GuideListRow({
  status,
  title,
  description,
  note,
  onPress,
}: {
  status: GuideStatus;
  title: string;
  description: string;
  note?: string;
  onPress?: () => void;
}) {
  const content = (
    <View className="flex-row items-start justify-between gap-3">
      <View className="min-w-0 flex-1">
        <Text className="font-pretendard text-large-bold text-neutral-black1">
          {title}
        </Text>
        <Text className="mt-1 font-pretendard text-normal-regular text-neutral-black2">
          {description}
        </Text>
        {note ? (
          <Text className="mt-2 font-pretendard text-normal-regular text-erum-secondary">
            {note}
          </Text>
        ) : null}
      </View>

      <View
        className={`rounded-full px-3 py-1 ${statusClassName[status]}`}
      >
        <Text className="font-pretendard text-normal-bold text-neutral-white">
          {statusLabel[status]}
        </Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        className="rounded-xl border border-neutral-grey1 bg-neutral-white p-4"
        onPress={onPress}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View className="rounded-xl border border-neutral-grey1 bg-neutral-white p-4">
      {content}
    </View>
  );
}
