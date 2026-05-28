import { Pressable, ScrollView, Text, View } from 'react-native';

import {
  BottomNav,
  CardSection,
  Divider,
  InfoRow,
  MypageFrame,
  MypageHeader,
} from '../components/MypageLayout';

interface PaymentDetailScreenProps {
  showReceipt?: boolean;
  onBack?: () => void;
  onPressReceipt?: () => void;
}

export function PaymentDetailScreen({
  showReceipt = false,
  onBack,
  onPressReceipt,
}: PaymentDetailScreenProps) {
  return (
      <MypageFrame backgroundClassName="bg-zinc-50">
        <MypageHeader title="결제내역 상세보기" onBack={onBack} />
        <ScrollView
          className="w-full flex-1"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-[360px] flex-1 self-center px-4 pb-44 pt-6">
            <CardSection>
              <View className="w-full items-center py-2">
                <View className="h-16 w-16 items-center justify-center rounded-full bg-emerald-300">
                  <Text className="text-5xl font-light leading-[56px] text-white">
                    ✓
                  </Text>
                </View>
                <Text className="mt-4 text-center text-base leading-6 text-slate-500">
                  이번 결제로 4,070원 아꼈어요!{'\n'}
                  쿠민카드 문구 10% 할인 적용{'\n'}
                  최적 결제 방식 적용 완료
                </Text>
              </View>
            </CardSection>

            <View className="mt-4">
              <CardSection>
                <Text className="mb-4 text-lg font-bold text-slate-950">
                  결제 정보
                </Text>
                <InfoRow label="결제상태" value="결제완료" valueClassName="text-emerald-400" />
                <InfoRow label="결제일시" value="2026.04.25 21:00:01" />
                <InfoRow label="영수증ID" value="123-456-789" />
              </CardSection>
            </View>

            <View className="mt-4">
              <CardSection>
                <Text className="mb-4 text-lg font-bold text-slate-950">
                  판매자정보
                </Text>
                <InfoRow label="판매자상호" value="코보문고 양정점" />
                <InfoRow label="사업자번호" value="123-45-67890" />
                <InfoRow label="사업자주소" value="서울 마포구 양정길 양정역 앞" />
                <InfoRow label="대표자명" value="나사장" />
                <InfoRow label="전화번호" value="02-987-7654" />
              </CardSection>
            </View>

            <View className="mt-4">
              <CardSection>
                <Text className="mb-4 text-lg font-bold text-slate-950">
                  금액 정보
                </Text>
                <InfoRow label="상품금액" value="34,000원" />
                <InfoRow label="할인금액" value="-4,070원" valueClassName="text-red-500" />
                <Divider />
                <InfoRow label="부가세" value="3,090원" />
                <Divider />
                <View className="w-full flex-row items-center justify-between py-3">
                  <Text className="text-lg font-bold text-slate-950">
                    최종결제금액
                  </Text>
                  <Text className="text-2xl font-bold text-blue-800">
                    33,020원
                  </Text>
                </View>
              </CardSection>
            </View>

            <Pressable
              accessibilityRole="button"
              className="mt-4 h-11 w-full flex-row items-center justify-center rounded-xl bg-blue-800"
              onPress={onPressReceipt}
            >
              <Text className="mr-2 text-xl text-white">▤</Text>
              <Text className="text-base font-bold text-white">전자영수증</Text>
            </Pressable>
          </View>
        </ScrollView>

        <BottomNav active="pay" />
        {showReceipt ? <ReceiptModal /> : null}
      </MypageFrame>
  );
}

function ReceiptModal() {
  return (
    <View className="absolute inset-0 bg-black/55 px-4 pt-[178px]">
      <View className="w-full rounded-2xl bg-white px-6 pb-6 pt-5">
        <View className="w-full items-end">
          <Text className="text-3xl font-light leading-8 text-slate-950">×</Text>
        </View>
        <View className="w-full items-center">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-emerald-300">
            <Text className="text-5xl font-light leading-[56px] text-white">✓</Text>
          </View>
          <Text className="mt-4 text-3xl font-bold text-slate-950">영수증</Text>
        </View>

        <View className="mt-6">
          <InfoRow label="결제상태" value="결제완료" valueClassName="text-emerald-400" />
          <InfoRow label="결제일시" value="2026.04.25 21:00:01" />
          <InfoRow label="영수증ID" value="123-456-789" />
        </View>
        <View className="my-5 h-px w-full bg-zinc-200" />
        <Text className="mb-4 text-lg font-bold text-slate-950">
          판매자상호 및 정보
        </Text>
        <InfoRow label="판매자상호" value="코보문고 양정점" />
        <InfoRow label="사업자번호" value="123-45-67890" />
        <InfoRow label="사업자주소" value="서울 마포구 양정길 양정역 앞" />
        <InfoRow label="대표자명" value="나사장" />
        <InfoRow label="전화번호" value="02-987-7654" />
        <View className="my-5 h-px w-full bg-red-400" />
        <InfoRow label="상품금액" value="34,000원" />
        <InfoRow label="할인금액" value="-4,070원" valueClassName="text-red-500" />
        <InfoRow label="부가세" value="3,090원" />
        <View className="mt-5 items-center rounded-xl bg-zinc-50 py-5">
          <Text className="text-sm text-slate-500">총 결제금액</Text>
          <Text className="mt-2 text-3xl font-bold text-blue-800">33,020원</Text>
        </View>
      </View>
    </View>
  );
}

export default PaymentDetailScreen;
