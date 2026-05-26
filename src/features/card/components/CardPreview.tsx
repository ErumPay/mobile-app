import { Text, View } from 'react-native';

import { onlyDigits } from '../types/cardFormat';

interface CardPreviewProps {
  cardNumber: string;
  cardCompany?: string;
  cardName?: string;
}

export function CardPreview({
  cardNumber,
  cardCompany = '카드사',
  cardName = '카드명',
}: CardPreviewProps) {
  const displayCardNumber =
    onlyDigits(cardNumber)
      .slice(0, 16)
      .padEnd(16, '*')
      .replace(/(.{4})(?=.)/g, '$1-') || '****-****-****-****';

  return (
    <View className="w-full rounded-xl border border-zinc-100 bg-white p-4 shadow-sm">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-zinc-500">{cardCompany}</Text>
        <Text className="text-sm font-bold text-zinc-950">{cardName}</Text>
      </View>
      <Text className="mt-4 text-base font-semibold text-zinc-800">
        {displayCardNumber}
      </Text>
    </View>
  );
}

export default CardPreview;
