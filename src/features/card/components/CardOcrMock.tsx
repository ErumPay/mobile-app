import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

interface CardOcrMockProps {
  onClose?: () => void;
  onRegister: () => void;
  onChangeManual: () => void;
}

export function CardOcrMock({
  onClose,
  onRegister,
  onChangeManual,
}: CardOcrMockProps) {
  const [isScanned, setIsScanned] = useState(false);

  const handleCapture = () => {
    // TODO: 실제 카메라 촬영 및 OCR API 연결
    setIsScanned(true);
  };

  if (isScanned) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-600 py-8">
        <View className="w-full rounded-2xl bg-white px-6 py-7">
          <Text className="text-center text-lg font-bold text-slate-950">
            OCR로 확인된 카드입니다!
          </Text>

          <View className="mt-7 gap-4 rounded-xl bg-zinc-50 px-4 py-4">
            <OcrInfo label="카드사" value="신한카드" />
            <OcrInfo label="카드명" value="Deep Dream 카드" />
            <OcrInfo label="카드번호" value="1234-5556-2432-5678" />
          </View>

          <View className="mt-6 gap-2">
            <Pressable
              accessibilityRole="button"
              className="min-h-[45px] items-center justify-center rounded-lg bg-blue-700 px-4 py-3"
              onPress={onRegister}
            >
              <Text className="text-base font-bold text-white">
                카드 등록하기
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              className="min-h-[45px] items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-3"
              onPress={() => setIsScanned(false)}
            >
              <Text className="text-base font-bold text-slate-700">
                다시 촬영하기
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="w-full flex-1 bg-black">
      <View className="h-[52px] flex-row items-center justify-center">
        <Pressable
          accessibilityRole="button"
          className="absolute left-0 h-10 w-10 items-center justify-center"
          onPress={onClose}
        >
          <Text className="text-4xl font-light leading-10 text-white">×</Text>
        </Pressable>
        <Text className="text-lg font-bold text-white">카드 촬영</Text>
      </View>

      <View className="flex-1">
        <View className="flex-1 justify-center">
          <View className="aspect-[1.75] w-full items-center justify-center rounded-xl border-2 border-emerald-300">
            <View className="h-9 w-16 rounded-sm bg-yellow-100" />
          </View>
        </View>

        <View className="pb-8">
          <Text className="text-center text-base font-bold text-white">
            카드를 프레임 안에 맞춰주세요
          </Text>
          <Text className="mt-3 text-center text-sm text-zinc-500">
            카드 전체가 보이도록 촬영해주세요
          </Text>

          <View className="mt-6 items-center">
            <Pressable
              accessibilityRole="button"
              className="h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-blue-700"
              onPress={handleCapture}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            className="mt-4 h-8 items-center justify-center"
            onPress={onChangeManual}
          >
            <Text className="text-xs text-transparent">직접 입력</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function OcrInfo({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text className="text-sm text-slate-500">{label}</Text>
      <Text className="mt-2 text-base font-bold text-slate-950">{value}</Text>
    </View>
  );
}

export default CardOcrMock;
