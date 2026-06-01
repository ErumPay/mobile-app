import { Pressable, Text, View } from "react-native";

import { Skeleton } from "../../../shared/components/Skeleton";

export type PaymentHistory = {
  id: number;
  merchantName: string;
  cardName: string;
  cardNumber: string;
  amount: string;
  paidAt: string;
};

type RecentPaymentHistoryProps = {
  histories: PaymentHistory[];
  isLoading?: boolean;
  maxVisibleCount?: number;
};

export function RecentPaymentHistory({
  histories,
  isLoading = false,
  maxVisibleCount = 2,
}: RecentPaymentHistoryProps) {
  const visibleHistories = histories.slice(0, maxVisibleCount);

  return (
    <View>
      {isLoading ? (
        <RecentPaymentHistorySkeletonContent />
      ) : (
        <>
          <View className="flex-row items-center justify-between">
            <Text className="font-pretendard text-heading-3 text-neutral-black1">
              최근 결제 내역
            </Text>
            <Pressable accessibilityRole="button">
              <Text className="font-pretendard text-normal-bold text-erum-secondary">
                더보기 →
              </Text>
            </Pressable>
          </View>

          <View className="mt-3 gap-3">
            {visibleHistories.length > 0 ? (
              visibleHistories.map((history) => (
                <PaymentHistoryRow key={history.id} history={history} />
              ))
            ) : (
              <EmptyHistoryCard />
            )}
          </View>
        </>
      )}
    </View>
  );
}

export function RecentPaymentHistorySkeleton() {
  return (
    <View>
      <RecentPaymentHistorySkeletonContent />
    </View>
  );
}

function RecentPaymentHistorySkeletonContent() {
  return (
    <>
      <View className="flex-row items-center justify-between">
        <Skeleton width="34%" height={18} />
        <Skeleton width={54} height={14} />
      </View>

      <View className="mt-3 gap-3">
        {[0, 1].map((item) => (
          <View
            key={item}
            className="flex-row items-center justify-between rounded-xl border border-neutral-grey1 bg-neutral-white px-4 py-4"
          >
            <View className="min-w-0 flex-1 pr-3">
              <Skeleton width="46%" height={16} />
              <View className="mt-2">
                <Skeleton width="76%" height={12} />
              </View>
            </View>
            <View className="w-[88px] items-end">
              <Skeleton width="100%" height={16} />
              <View className="mt-2 w-[52px]">
                <Skeleton width="100%" height={12} />
              </View>
            </View>
          </View>
        ))}
      </View>
    </>
  );
}

function PaymentHistoryRow({ history }: { history: PaymentHistory }) {
  return (
    <View className="flex-row items-center justify-between rounded-xl border border-neutral-grey1 bg-neutral-white px-4 py-4">
      <View className="min-w-0 flex-1 pr-3">
        <Text className="font-pretendard text-large-bold text-neutral-black1">
          {history.merchantName}
        </Text>
        <Text
          numberOfLines={1}
          className="mt-1 font-pretendard text-normal-regular text-neutral-black2"
        >
          {history.cardName}({history.cardNumber.slice(-4)})
        </Text>
      </View>
      <View className="items-end">
        <Text className="font-pretendard text-large-bold text-neutral-black1">
          {history.amount}
        </Text>
        <Text className="mt-1 font-pretendard text-normal-regular text-neutral-black2">
          {history.paidAt}
        </Text>
      </View>
    </View>
  );
}

function EmptyHistoryCard() {
  return (
    <View className="h-[58px] items-center justify-center rounded-xl border border-neutral-grey1 bg-neutral-white">
      <Text className="font-pretendard text-normal-regular text-neutral-black2">
        최근 결제 내역이 없습니다.
      </Text>
    </View>
  );
}

export default RecentPaymentHistory;
