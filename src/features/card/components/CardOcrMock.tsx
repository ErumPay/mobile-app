import { Pressable, Text, View } from 'react-native';

interface CardOcrMockProps {
  onCapture: () => void;
  onChangeManual: () => void;
}

export function CardOcrMock({
  onCapture,
  onChangeManual,
}: CardOcrMockProps) {
  const handleCapture = () => {
    // TODO: expo-camera 또는 이미지 선택 연결
    // TODO: 촬영 이미지 OCR API로 전송
    // TODO: OCR 결과로 cardNumber, expiry 자동 입력
    onCapture();
  };

  return (
    <View className="gap-6">
      <Text className="text-2xl font-bold leading-8 text-zinc-950">
        카드를 촬영해 주세요
      </Text>

      <View className="overflow-hidden rounded-3xl bg-zinc-900 px-5 py-8">
        <View className="mb-6 flex-row items-center justify-between">
          <View className="h-2 w-2 rounded-full bg-red-400" />
          <Text className="text-xs font-semibold text-zinc-400">OCR MOCK</Text>
        </View>

        <View className="aspect-[1.586] items-center justify-center rounded-2xl border-2 border-dashed border-white/80 bg-zinc-800">
          <View className="absolute left-4 top-4 h-8 w-8 border-l-4 border-t-4 border-blue-300" />
          <View className="absolute right-4 top-4 h-8 w-8 border-r-4 border-t-4 border-blue-300" />
          <View className="absolute bottom-4 left-4 h-8 w-8 border-b-4 border-l-4 border-blue-300" />
          <View className="absolute bottom-4 right-4 h-8 w-8 border-b-4 border-r-4 border-blue-300" />

          <View className="h-12 w-16 rounded-md bg-zinc-700" />
          <View className="mt-7 h-3 w-44 rounded-full bg-zinc-700" />
          <View className="mt-3 h-3 w-32 rounded-full bg-zinc-700" />
        </View>
      </View>

      <Text className="text-center text-sm leading-5 text-zinc-500">
        카드번호와 유효기간이 잘 보이도록 맞춰주세요
      </Text>

      <View className="gap-3">
        <Pressable
          accessibilityRole="button"
          className="h-14 items-center justify-center rounded-xl bg-blue-500"
          onPress={handleCapture}
        >
          <Text className="text-base font-semibold text-white">촬영하기</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          className="h-14 items-center justify-center rounded-xl border border-zinc-200 bg-white"
          onPress={onChangeManual}
        >
          <Text className="text-base font-semibold text-zinc-800">
            직접 입력으로 변경
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default CardOcrMock;
