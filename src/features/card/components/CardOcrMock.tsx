import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { Header } from '../../../shared/components/Header';

import { mockOcrCard } from '../mocks/cardMockData';

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
      <View className="w-full flex-1 items-center justify-center bg-zinc-600 py-8">
        <View className="w-full rounded-2xl bg-white px-6 py-7">
          <Text className="text-center text-lg font-bold text-slate-950">
            OCR로 확인된 카드입니다!
          </Text>

          <Card>
            <View className="gap-4">
              <OcrInfo label="카드사" value={mockOcrCard.issuer} />
              <OcrInfo label="카드명" value={mockOcrCard.name} />
              <OcrInfo label="카드번호" value={mockOcrCard.number} />
            </View>
          </Card>

          <View className="mt-6 w-full gap-2">
            <Button label="카드 등록하기" onPress={onRegister} />

            <Button
              label="다시 촬영하기"
              variant="secondary"
              onPress={() => setIsScanned(false)}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="w-full flex-1 bg-black">
      <Header
        title="카드 촬영"
        type="close"
        tone="dark"
        onPressRight={onClose}
      />

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
