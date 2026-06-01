import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { Card } from '../../../shared/components/Card';
import { FloatingButton } from '../../../shared/components/FloatingButton';
import { Header } from '../../../shared/components/Header';
import { ListItem } from '../../../shared/components/ListItem';
import { PageWrap } from '../../../shared/components/PageWrap';

export function MypageFrame({
  children,
  title,
  onBack,
  backgroundClassName = 'bg-neutral-grey2',
}: {
  children: ReactNode;
  title: string;
  onBack?: () => void;
  backgroundClassName?: string;
}) {
  return (
    <PageWrap
      backgroundClassName={backgroundClassName}
      header={<Header title={title} type="back" onPressLeft={onBack} />}
    >
      {children}
    </PageWrap>
  );
}

export function MypageBottomNav({
  active = 'my',
  onChange,
}: {
  active?: 'home' | 'payment' | 'my';
  onChange?: (value: string) => void;
}) {
  return <FloatingButton value={active} onChange={onChange} />;
}

export function MenuRow({
  title,
  description,
  left,
  right,
  onPress,
}: {
  title: string;
  description?: string;
  left?: ReactNode;
  right?: ReactNode;
  onPress?: () => void;
}) {
  return (
    <ListItem
      title={title}
      description={description}
      left={left}
      right={right ?? <Text className="text-heading-3 text-neutral-black2">›</Text>}
      onPress={onPress}
    />
  );
}

export function CardSection({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return <Card title={title}>{children}</Card>;
}

export function InfoRow({
  label,
  value,
  valueClassName = 'text-neutral-black1',
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text className="font-pretendard text-large-regular text-neutral-black2">
        {label}
      </Text>
      <Text
        numberOfLines={2}
        className={`min-w-0 flex-1 text-right font-pretendard text-large-bold ${valueClassName}`}
      >
        {value}
      </Text>
    </View>
  );
}

export function Divider() {
  return <View className="my-2 h-px w-full bg-neutral-grey1" />;
}
