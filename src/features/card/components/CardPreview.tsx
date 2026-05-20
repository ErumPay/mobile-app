import { Text, View } from 'react-native';

import { onlyDigits } from '../types/cardFormat';

interface CardPreviewProps {
  cardNumber: string;
  cardCompany?: string;
  cardName?: string;
}

export function CardPreview({
  cardNumber,
  cardCompany,
  cardName,
}: CardPreviewProps) {
  const displayCardNumber =
    onlyDigits(cardNumber)
      .slice(0, 16)
      .padEnd(16, '*')
      .replace(/(.{4})(?=.)/g, '$1-') || '****-****-****-****';

  return (
    <View className="rounded-2xl bg-zinc-950 p-5 shadow-lg">
      <View className="flex-row items-start justify-between">
        <Text className="text-sm font-semibold text-zinc-300">
          {cardCompany || '카드사'}
        </Text>
        <Text className="text-sm font-semibold text-emerald-300">
          {cardName || '카드명'}
        </Text>
      </View>

      <View className="mt-8 h-9 w-12 rounded-md bg-amber-300" />

      <Text className="mt-8 text-xl font-semibold tracking-wider text-white">
        {displayCardNumber}
      </Text>
    </View>
  );
}

export default CardPreview;
