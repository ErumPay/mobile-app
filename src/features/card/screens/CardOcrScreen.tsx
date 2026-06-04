import { useRef, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import type { Action } from 'expo-image-manipulator';

import { Button } from '../../../shared/components/Button';
import { Header } from '../../../shared/components/Header';
import { Loading } from '../../../shared/components/Loading';
import { PageWrap } from '../../../shared/components/PageWrap';

import { uploadCardImage } from '../api/cardOcrApi';

interface CardOcrScreenProps {
  onClose: () => void;
  onConfirmOcrResult: (values: {
    cardNumber: string;
    expiry: string;
  }) => void;
}

const MAX_IMAGE_SIDE = 512;
const CARD_FRAME_ASPECT_RATIO = 1.58;

function getCardFrameImageActions(width: number, height: number): Action[] {
  const imageAspectRatio = width / height;

  let cropWidth = width;
  let cropHeight = height;

  if (imageAspectRatio > CARD_FRAME_ASPECT_RATIO) {
    cropWidth = height * CARD_FRAME_ASPECT_RATIO;
  } else {
    cropHeight = width / CARD_FRAME_ASPECT_RATIO;
  }

  cropWidth = Math.round(cropWidth);
  cropHeight = Math.round(cropHeight);

  const originX = Math.round((width - cropWidth) / 2);
  const originY = Math.round((height - cropHeight) / 2);

  const actions: Action[] = [
    {
      crop: {
        originX,
        originY,
        width: cropWidth,
        height: cropHeight,
      },
    },
  ];

  const longSide = Math.max(cropWidth, cropHeight);

  if (longSide > MAX_IMAGE_SIDE) {
    actions.push(
      cropWidth >= cropHeight
        ? { resize: { width: MAX_IMAGE_SIDE } }
        : { resize: { height: MAX_IMAGE_SIDE } },
    );
  }

  return actions;
}

export function CardOcrScreen({
  onClose,
  onConfirmOcrResult,
}: CardOcrScreenProps) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isTakingPicture, setIsTakingPicture] = useState(false);


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

      const cardFrameImageActions = getCardFrameImageActions(
        photo.width,
        photo.height,
      );

      const manipulatedImage = await ImageManipulator.manipulateAsync(
        photo.uri,
        cardFrameImageActions,
        {
          compress: 0.9,
          format: ImageManipulator.SaveFormat.JPEG,
        },
      );

      const ocrResult = await uploadCardImage(manipulatedImage.uri);
      onConfirmOcrResult({
        cardNumber: ocrResult.cardNumber,
        expiry: ocrResult.expiry,
      });
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

  if (isTakingPicture) {
    return (
      <PageWrap
        scroll={false}
        padded={false}
        backgroundClassName="bg-neutral-white"
      >
        <Loading message="카드 정보를 불러오는 중입니다." fullScreen />
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
      <View className="flex-1 bg-black px-5 pb-8 pt-8">
          <View className="flex-1 justify-center">
            <View className="aspect-[1.58] w-full overflow-hidden rounded-2xl border-2 border-erum-primary">
              <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
            </View>
          </View>

          <View className="items-center">
            <Text className="text-center font-pretendard text-heading-3 text-neutral-white">
              카드를 프레임 안에 맞춰주세요
            </Text>

            <Text className="mt-2 text-center font-pretendard text-normal-regular text-neutral-disabled">
              프레임 안의 카드 이미지를 JPEG로 변환해 전송합니다
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
    </PageWrap>
  );
}

export default CardOcrScreen;
