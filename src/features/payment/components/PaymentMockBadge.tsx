import { Text, View } from 'react-native';

export default function PaymentMockBadge() {
  return (
    <View className="self-start rounded-full border border-neutral-grey1 bg-neutral-grey2 px-2 py-1">
      <Text className="font-pretendard text-small-regular text-neutral-black2">
        mock
      </Text>
    </View>
  );
}
