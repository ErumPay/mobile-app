import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

interface DialogProps {
  onConfirm?: () => void;
  onClose?: () => void;
}

export function LogoutDialog({ onConfirm, onClose }: DialogProps) {
  return (
    <DialogShell>
      <Text className="text-5xl">👋</Text>
      <Text className="mt-8 text-lg font-bold text-slate-950">
        로그아웃 하시겠습니까?
      </Text>
      <DialogActions
        confirmText="로그아웃하기"
        onConfirm={onConfirm}
        onClose={onClose}
      />
    </DialogShell>
  );
}

export function WithdrawDialog({ onConfirm, onClose }: DialogProps) {
  return (
    <DialogShell>
      <Text className="text-5xl text-yellow-400">▲</Text>
      <Text className="mt-8 text-lg font-bold text-slate-950">
        정말 회원 탈퇴를 하시겠습니까?
      </Text>
      <Text className="mt-3 text-center text-sm leading-6 text-slate-500">
        탈퇴 후 모든 데이터가 삭제되며{'\n'}복구할 수 없습니다
      </Text>
      <DialogActions
        confirmText="회원탈퇴하기"
        onConfirm={onConfirm}
        onClose={onClose}
      />
    </DialogShell>
  );
}

function DialogShell({ children }: { children: ReactNode }) {
  return (
    <View className="min-h-full w-full max-w-[390px] flex-1 self-center items-center justify-center bg-black px-8">
      <View className="w-full items-center rounded-2xl bg-white px-6 py-10">
        {children}
      </View>
    </View>
  );
}

function DialogActions({
  confirmText,
  onConfirm,
  onClose,
}: {
  confirmText: string;
  onConfirm?: () => void;
  onClose?: () => void;
}) {
  return (
    <View className="mt-8 w-full gap-3">
      <Pressable
        accessibilityRole="button"
        className="h-12 w-full items-center justify-center rounded-xl bg-emerald-700"
        onPress={onConfirm}
      >
        <Text className="text-base font-bold text-white">{confirmText}</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        className="h-12 w-full items-center justify-center rounded-xl border border-emerald-700 bg-white"
        onPress={onClose}
      >
        <Text className="text-base font-bold text-emerald-700">닫기</Text>
      </Pressable>
    </View>
  );
}
