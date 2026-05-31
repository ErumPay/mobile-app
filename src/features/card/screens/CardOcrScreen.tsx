import { useRef, useState } from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';

import { Button } from '../../../shared/components/Button';
import { Header } from '../../../shared/components/Header';
import { PageWrap } from '../../../shared/components/PageWrap';

interface CardOcrScreenProps {
  onClose?: () => void;
}

type ProcessedCardImage = {
  uri: string;
  width: number;
  height: number;
};

const MAX_IMAGE_SIDE = 1024;

function getResizeAction(width: number, height: number) {
  const longSide = Math.max(width, height);

  if (longSide <= MAX_IMAGE_SIDE) {
    return [];
  }

  if (width >= height) {
    return [{ resize: { width: MAX_IMAGE_SIDE } }];
  }

  return [{ resize: { height: MAX_IMAGE_SIDE } }];
}

export function CardOcrScreen({ onClose }: CardOcrScreenProps) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isTakingPicture, setIsTakingPicture] = useState(false);
  const [processedImage, setProcessedImage] =
    useState<ProcessedCardImage | null>(null);

  const handleTakePicture = async () => {
    if (!cameraRef.current || isTakingPicture) {
      return;
    }

    try {
      setIsTakingPicture(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
      });

      if (!photo) {
        return;
      }

      const resizeActions = getResizeAction(photo.width, photo.height);

      const manipulatedImage = await ImageManipulator.manipulateAsync(
        photo.uri,
        resizeActions,
        {
          compress: 0.9,
          format: ImageManipulator.SaveFormat.JPEG,
        },
      );

      setProcessedImage({
        uri: manipulatedImage.uri,
        width: manipulatedImage.width,
        height: manipulatedImage.height,
      });

      // 촬영된 이미지는 미리보기 화면에서 사용자가 확인한 뒤 전송합니다.

    } catch {
      Alert.alert('안내', '카드 이미지를 촬영하지 못했습니다.');
    } finally {
      setIsTakingPicture(false);
    }
  };

  if (!permission) {
    return (
      <PageWrap
        scroll={false}
        padded={false}
        backgroundClassName="bg-black"
        header={
          <Header
            title="카드 촬영"
            type="close"
            tone="dark"
            onPressRight={onClose}
          />
        }
      >
        <View className="flex-1 bg-black" />
      </PageWrap>
    );
  }

  if (!permission.granted) {
    return (
      <PageWrap
        scroll={false}
        backgroundClassName="bg-black"
        header={
          <Header
            title="카드 촬영"
            type="close"
            tone="dark"
            onPressRight={onClose}
          />
        }
      >
        <View className="flex-1 items-center justify-center gap-5">
          <Text className="text-center font-pretendard text-heading-3 text-neutral-white">
            카드 스캔을 위해 카메라 권한이 필요합니다.
          </Text>

          <Button label="카메라 권한 허용" onPress={requestPermission} />
        </View>
      </PageWrap>
    );
  }

  if (processedImage) {
    return (
      <PageWrap
        scroll={false}
        padded={false}
        backgroundClassName="bg-black"
        header={
          <Header
            title="카드 촬영"
            type="close"
            tone="dark"
            onPressRight={onClose}
          />
        }
      >
        <View className="flex-1 bg-black px-5 py-6">
          <View className="flex-1 justify-center">
            <Image
              source={{ uri: processedImage.uri }}
              className="aspect-[1.58] w-full rounded-2xl"
              resizeMode="contain"
            />
          </View>

          <View className="gap-3 pb-4">
            <Text className="text-center font-pretendard text-normal-regular text-neutral-white">
              변환 완료: {processedImage.width} x {processedImage.height}
            </Text>

            <Button
              label="다시 촬영하기"
              variant="secondary"
              onPress={() => setProcessedImage(null)}
            />

            <Button
              label="이 이미지로 등록하기"
              onPress={() => {
                // TODO: 백엔드 OCR API 연결 시 여기서 JPEG 이미지 파일 전송
                // - processedImage.uri: JPEG로 변환된 이미지 경로
                // - processedImage.width / processedImage.height: 1024px 기준으로 조정된 이미지 크기
                // - FormData에 image 필드로 담아서 multipart/form-data 방식으로 전송 예정
                // 예시:
                // const formData = new FormData();
                // formData.append('image', {
                //   uri: processedImage.uri,
                //   name: 'card.jpeg',
                //   type: 'image/jpeg',
                // } as unknown as Blob);
                // await fetch('백엔드_API_URL', {
                //   method: 'POST',
                //   body: formData,
                // });
              }}
            />
          </View>
        </View>
      </PageWrap>
    );
  }

  return (
    <PageWrap
      scroll={false}
      padded={false}
      backgroundClassName="bg-black"
      header={
        <Header
          title="카드 촬영"
          type="close"
          tone="dark"
          onPressRight={onClose}
        />
      }
    >
      <View className="flex-1 bg-black">
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back">
        <View className="flex-1 justify-between px-5 pb-8 pt-8">
          <View className="flex-1 justify-center">
            <View className="aspect-[1.58] w-full rounded-2xl border-2 border-erum-primary" />
          </View>

          <View className="items-center">
            <Text className="text-center font-pretendard text-heading-3 text-neutral-white">
              카드를 프레임 안에 맞춰주세요
            </Text>

            <Text className="mt-2 text-center font-pretendard text-normal-regular text-neutral-disabled">
              촬영한 이미지는 JPEG로 변환되어 전송됩니다
            </Text>

            <Pressable
              accessibilityRole="button"
              className="mt-6 h-16 w-16 items-center justify-center rounded-full border-4 border-neutral-white bg-erum-main"
              disabled={isTakingPicture}
              onPress={handleTakePicture}
            >
              <View className="h-11 w-11 rounded-full bg-neutral-white" />
            </Pressable>
          </View>
        </View>
      </CameraView>
    </View>
    </PageWrap>
  );
}

export default CardOcrScreen;