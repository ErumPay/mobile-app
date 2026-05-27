import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

interface DialogProps {
  onConfirm?: () => void;
  onClose?: () => void;
}

export function LogoutDialog(props: DialogProps) {
  return (
    <DialogShell>
      <Text className="text-5xl">👋</Text>
      <Text className="mt-8 text-center text-lg font-bold text-slate-950">
        로그아웃 하시겠습니까?
      </Text>
      <DialogActions confirmText="로그아웃하기" {...props} />
    </DialogShell>
  );
}

export function WithdrawDialog(props: DialogProps) {
  return (
    <DialogShell>
      <Text className="text-5xl text-yellow-400">▲</Text>
      <Text className="mt-8 text-center text-lg font-bold text-slate-950">
        정말 회원 탈퇴를 하시겠습니까?
      </Text>
      <Text className="mt-3 text-center text-sm leading-6 text-slate-500">
        탈퇴 후 모든 데이터가 삭제되며{'\n'}복구할 수 없습니다
      </Text>
      <DialogActions confirmText="회원탈퇴하기" {...props} />
    </DialogShell>
  );
}

export function DeleteCardDialog(props: DialogProps) {
  return (
    <DialogShell>
      <Text className="text-5xl">🗑️</Text>
      <Text className="mt-8 text-center text-lg font-bold leading-7 text-slate-950">
        Nany My 카드를{'\n'}삭제하시겠습니까?
      </Text>
      <DialogActions confirmText="삭제하기" {...props} />
    </DialogShell>
  );
}

export function DeleteCardCompleteDialog(props: DialogProps) {
  return (
    <DialogShell>
      <View className="h-16 w-16 items-center justify-center rounded-xl bg-green-500">
        <Text className="text-5xl font-light leading-[56px] text-white">✓</Text>
      </View>
      <Text className="mt-10 text-center text-lg font-bold text-slate-950">
        카드 삭제가 완료되었습니다.
      </Text>
      <DialogActions confirmText="확인" single {...props} />
    </DialogShell>
  );
}

export function SetDefaultCardDialog(props: DialogProps) {
  return (
    <DialogShell>
      <Text className="text-5xl">⭐</Text>
      <Text className="mt-8 text-center text-lg font-bold leading-7 text-slate-950">
        Nany My 카드를{'\n'}대표카드로 지정 하시겠습니까?
      </Text>
      <Text className="mt-3 text-center text-sm text-slate-500">
        결제 시 우선으로 사용됩니다
      </Text>
      <DialogActions confirmText="대표카드 설정하기" {...props} />
    </DialogShell>
  );
}

export function EditCardAliasDialog(props: DialogProps) {
  return (
    <DialogShell>
      <Text className="text-5xl">✏️</Text>
      <Text className="mt-8 text-center text-lg font-bold leading-7 text-slate-950">
        Nany My 카드 별칭을{'\n'}수정하시겠습니까?
      </Text>
      <DialogActions confirmText="별칭 수정하기" {...props} />
    </DialogShell>
  );
}

function DialogShell({ children }: { children: ReactNode }) {
  return (
    <View className="flex-1 w-[360px] max-w-full flex-col items-start self-center bg-black px-8">
      <View className="mt-[180px] w-full items-center rounded-2xl bg-white px-6 py-10">
        {children}
      </View>
    </View>
  );
}

function DialogActions({
  confirmText,
  single = false,
  onConfirm,
  onClose,
}: {
  confirmText: string;
  single?: boolean;
  onConfirm?: () => void;
  onClose?: () => void;
}) {
  return (
    <View className="mt-8 w-full">
      <Pressable
        accessibilityRole="button"
        className="h-12 w-full items-center justify-center rounded-xl bg-emerald-700"
        onPress={onConfirm}
      >
        <Text className="text-base font-bold text-white">{confirmText}</Text>
      </Pressable>
      {single ? null : (
        <Pressable
          accessibilityRole="button"
          className="mt-3 h-12 w-full items-center justify-center rounded-xl border border-emerald-700 bg-white"
          onPress={onClose}
        >
          <Text className="text-base font-bold text-emerald-700">닫기</Text>
        </Pressable>
      )}
    </View>
  );
}
