import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../../App';
import Button from '../../../shared/components/Button';
import PageWrap from '../../../shared/components/PageWrap';
import { acceptRemotePaymentRequest } from '../api/remotePaymentApi';
import { useRemotePaymentProgressStore } from '../stores/useRemotePaymentProgressStore';
import {
  enrichRemotePaymentRequesterName,
  toRemotePaymentRecipientSummary,
} from '../utils/remotePaymentAdapter';

type Props = NativeStackScreenProps<RootStackParamList, 'RemotePayInviteAccept'>;

function isValidRemoteRequestId(remoteRequestId: string) {
  return /^\d+$/.test(remoteRequestId) && Number(remoteRequestId) > 0;
}

export default function RemotePayInviteAcceptScreen({ navigation, route }: Props) {
  const [errorMessage, setErrorMessage] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const setRecipientProgress = useRemotePaymentProgressStore(
    (state) => state.setRecipientProgress,
  );

  useEffect(() => {
    let isMounted = true;

    const acceptInvite = async () => {
      if (!isValidRemoteRequestId(route.params.remoteRequestId)) {
        setErrorMessage('유효하지 않은 원격결제 요청입니다.');
        return;
      }

      try {
        const request = await enrichRemotePaymentRequesterName(
          await acceptRemotePaymentRequest(route.params.remoteRequestId),
        );

        if (!isMounted) {
          return;
        }

        setRecipientProgress(request);
        navigation.replace('PaymentMethodSelect', {
          remoteRequestId: request.remotePaymentRequestId,
          summary: toRemotePaymentRecipientSummary(request),
        });
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : '원격결제 공유 링크를 수락하지 못했습니다.',
          );
        }
      }
    };

    void acceptInvite();

    return () => {
      isMounted = false;
    };
  }, [
    navigation,
    route.params.remoteRequestId,
    retryKey,
    setRecipientProgress,
  ]);

  return (
    <PageWrap backgroundClassName="bg-neutral-white">
      <View className="flex-1 items-center justify-center px-5">
        <Text className="text-center font-pretendard text-heading-3 text-neutral-black1">
          {errorMessage
            ? '원격결제 요청을 확인하지 못했습니다.'
            : '원격결제 요청을 확인하고 있습니다.'}
        </Text>

        {errorMessage ? (
          <>
            <Text className="mt-4 text-center font-pretendard text-large-regular text-state-error">
              {errorMessage}
            </Text>
            <View className="mt-8 w-full gap-3">
              <Button
                label="다시 확인하기"
                onPress={() => {
                  setErrorMessage('');
                  setRetryKey((prev) => prev + 1);
                }}
              />
              <Button
                label="메인으로 이동"
                variant="secondary"
                onPress={() => navigation.replace('Main')}
              />
            </View>
          </>
        ) : (
          <Text className="mt-4 text-center font-pretendard text-large-regular text-neutral-black2">
            잠시만 기다려주세요.
          </Text>
        )}
      </View>
    </PageWrap>
  );
}
