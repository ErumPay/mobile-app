import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

interface MypageFrameProps {
  children: ReactNode;
  backgroundClassName?: string;
}

interface HeaderProps {
  title: string;
  onBack?: () => void;
}

interface BottomNavProps {
  active?: 'home' | 'pay' | 'my';
}

interface MenuRowProps {
  icon?: string;
  iconBgClassName?: string;
  iconTextClassName?: string;
  title: string;
  value?: string;
  onPress?: () => void;
}

export function MypageFrame({
  children,
  backgroundClassName = 'bg-white',
}: MypageFrameProps) {
  return (
    <View
      className="flex-1 w-full bg-white"
    >
      {children}
    </View>
  );
}

export function MypageHeader({ title, onBack }: HeaderProps) {
  return (
    <View className="h-[54px] w-full flex-row items-center border-b border-zinc-100 bg-white px-5">
      <Pressable
        accessibilityRole="button"
        className="mr-2 h-9 w-9"
        onPress={onBack}
      >
        <Text className="text-3xl font-light leading-9 text-zinc-950">‹</Text>
      </Pressable>
      <Text className="text-xl font-bold text-zinc-950">{title}</Text>
    </View>
  );
}

export function BottomNav({ active = 'pay' }: BottomNavProps) {
  return (
    <View className="absolute bottom-8 left-0 right-0 items-center">
      <View className="h-[84px] w-[292px] flex-row items-center justify-between rounded-full bg-white px-6 shadow-2xl">
        <NavItem icon="⌂" label="홈" active={active === 'home'} />
        <View className="-mt-8 items-center">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-blue-800 shadow-lg">
            <Text className="text-3xl font-bold leading-8 text-white">⌗</Text>
          </View>
          <Text className="mt-1 text-xs font-bold text-blue-800">결제</Text>
        </View>
        <NavItem icon="♙" label="MY" active={active === 'my'} />
      </View>
    </View>
  );
}

function NavItem({
  icon,
  label,
  active,
}: {
  icon: string;
  label: string;
  active: boolean;
}) {
  return (
    <View className="w-12 items-center">
      <View
        className={`h-11 w-11 items-center justify-center rounded-full ${
          active ? 'bg-blue-50' : 'bg-zinc-100'
        }`}
      >
        <Text
          className={`text-2xl ${
            active ? 'text-blue-800' : 'text-slate-500'
          }`}
        >
          {icon}
        </Text>
      </View>
      <Text
        className={`mt-1 text-xs ${
          active ? 'font-bold text-blue-800' : 'text-slate-500'
        }`}
      >
        {label}
      </Text>
    </View>
  );
}

export function MenuRow({
  icon,
  iconBgClassName = 'bg-blue-50',
  iconTextClassName = 'text-blue-700',
  title,
  value,
  onPress,
}: MenuRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className="h-12 w-full flex-row items-center justify-between"
      onPress={onPress}
    >
      <View className="flex-1 flex-row items-center">
        {icon ? (
          <View
            className={`mr-3 h-9 w-9 items-center justify-center rounded-full ${iconBgClassName}`}
          >
            <Text className={`text-lg ${iconTextClassName}`}>{icon}</Text>
          </View>
        ) : null}
        <Text className="text-base font-semibold text-slate-950">{title}</Text>
      </View>
      <View className="min-w-[26px] items-end">
        {value ? (
          <Text className="text-sm text-slate-400">{value}</Text>
        ) : (
          <Text className="text-2xl font-light leading-7 text-slate-400">
            ›
          </Text>
        )}
      </View>
    </Pressable>
  );
}

export function CardSection({ children }: { children: ReactNode }) {
  return (
    <View className="w-full rounded-2xl border border-zinc-100 bg-white px-4 py-4 shadow-sm">
      {children}
    </View>
  );
}

export function InfoRow({
  label,
  value,
  valueClassName = 'text-slate-950',
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <View className="w-full flex-row items-center justify-between py-2">
      <Text className="text-sm text-slate-500">{label}</Text>
      <Text className={`max-w-[220px] text-right text-base font-bold ${valueClassName}`}>
        {value}
      </Text>
    </View>
  );
}

export function Divider() {
  return <View className="h-px w-full bg-zinc-100" />;
}
