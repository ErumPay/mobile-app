import { Feather } from '@expo/vector-icons';
import { Pressable, Text, TextInput, View } from 'react-native';

import ActionMenu from '../../../shared/components/ActionMenu';
import FriendListItem from '../../../shared/components/FriendListItem';
import { colors } from '../../../shared/styles/designTokens';
import type { DutchPayMember } from '../types/dutchPay.types';

type Props = {
  member: DutchPayMember;
  isLast: boolean;
  menuOpen?: boolean;
  onPressMenu?: (memberId: string) => void;
  onPressRemoveMember?: (memberId: string) => void;
  onChangeEditableAmount?: (memberId: string, value: string) => void;
};

function formatAmount(amount: number) {
  return `${amount.toLocaleString('ko-KR')}원`;
}

function StatusCheck({ tone = 'success' }: { tone?: 'success' | 'error' }) {
  return (
    <View
      className="ml-2 h-5 w-5 items-center justify-center rounded-full"
      style={{
        backgroundColor:
          tone === 'success' ? colors.state.success : colors.state.error,
      }}
    >
      <Feather name="check" size={13} color={colors.neutral.white} />
    </View>
  );
}

function MemberBadge({
  label,
  filled,
}: {
  label: string;
  filled?: boolean;
}) {
  return (
    <View
      className={`mr-2 rounded-full px-2 py-1 ${
        filled ? 'bg-state-success' : 'border border-state-success bg-neutral-white'
      }`}
    >
      <Text
        className={`font-pretendard text-small-bold ${
          filled ? 'text-neutral-white' : 'text-state-success'
        }`}
      >
        {label}
      </Text>
    </View>
  );
}

function MemberStatusLine({
  member,
  onChangeEditableAmount,
}: {
  member: DutchPayMember;
  onChangeEditableAmount?: (memberId: string, value: string) => void;
}) {
  if (member.status === 'INPUT_EDITING') {
    return (
      <View className="mt-2 flex-row items-center gap-2">
        <View className="min-w-0 flex-1 rounded-lg border border-neutral-grey1 bg-neutral-white px-3 py-2">
          <TextInput
            accessibilityLabel={`${member.name} 결제 금액 입력`}
            keyboardType="number-pad"
            value={member.editableAmount ?? ''}
            className="font-pretendard text-normal-regular text-neutral-black2"
            onChangeText={(value) => onChangeEditableAmount?.(member.id, value)}
          />
        </View>
        <Text className="font-pretendard text-normal-regular text-neutral-black1">
          원
        </Text>
      </View>
    );
  }

  if (member.status === 'WAITING_AMOUNT') {
    return (
      <Text className="mt-1 font-pretendard text-normal-regular text-neutral-black2">
        금액 입력 대기 중
      </Text>
    );
  }

  if (member.status === 'PAYMENT_PENDING') {
    return (
      <Text className="mt-1 font-pretendard text-normal-bold text-erum-main">
        결제진행중
      </Text>
    );
  }

  if (member.status === 'PAYMENT_COMPLETED') {
    return (
      <View className="mt-1 flex-row items-center">
        <Text className="font-pretendard text-normal-bold text-erum-main">
          결제완료
        </Text>
        <StatusCheck />
      </View>
    );
  }

  if (member.status === 'PAYMENT_FAILED') {
    return (
      <View className="mt-1 flex-row items-center">
        <Text className="font-pretendard text-normal-bold text-state-error">
          결제실패
        </Text>
        <StatusCheck tone="error" />
      </View>
    );
  }

  if (member.amount) {
    const autoSplit = member.status === 'AUTO_SPLIT';
    const confirmed = member.status === 'AMOUNT_CONFIRMED' && !member.isOwner;

    return (
      <View className="mt-1 flex-row items-center">
        <Text className="font-pretendard text-normal-bold text-erum-main">
          {formatAmount(member.amount)}
        </Text>
        {autoSplit ? (
          <View className="ml-2 rounded-full bg-[#E7F7EC] px-2 py-1">
            <Text className="font-pretendard text-small-bold text-state-success">
              자동배분
            </Text>
          </View>
        ) : null}
        {confirmed ? <StatusCheck /> : null}
      </View>
    );
  }

  return null;
}

export default function DutchPayMemberRow({
  member,
  isLast,
  menuOpen = false,
  onPressMenu,
  onPressRemoveMember,
  onChangeEditableAmount,
}: Props) {
  return (
    <View className="relative">
      <FriendListItem
        name={member.name}
        initial={member.initial}
        phoneSuffix={member.phoneSuffix}
        containerClassName="flex-row items-center gap-3"
        contentClassName={`min-w-0 flex-1 py-5 ${isLast ? '' : 'border-b border-neutral-grey1'}`}
        nameClassName="min-w-0 flex-1 font-pretendard text-large-regular text-neutral-black1"
        badges={
          <>
            {member.isOwner ? <MemberBadge label="대표자" filled /> : null}
            {member.isMe && !member.isOwner ? <MemberBadge label="나" /> : null}
          </>
        }
        nameRight={
          member.canOpenMenu ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${member.name} 내보내기 메뉴`}
              hitSlop={10}
              className="h-8 w-8 items-center justify-center"
              onPress={() => onPressMenu?.(member.id)}
            >
              <Feather name="more-vertical" size={18} color={colors.neutral.black2} />
            </Pressable>
          ) : null
        }
      >
        <MemberStatusLine
          member={member}
          onChangeEditableAmount={onChangeEditableAmount}
        />
      </FriendListItem>

      <ActionMenu
        visible={menuOpen}
        className="absolute right-3 top-9 z-10"
        items={[
          {
            key: 'remove',
            label: '내보내기',
            tone: 'danger',
            onPress: () => onPressRemoveMember?.(member.id),
          },
        ]}
      />
    </View>
  );
}
