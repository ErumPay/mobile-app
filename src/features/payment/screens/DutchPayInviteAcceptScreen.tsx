import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../../App';
import Button from '../../../shared/components/Button';
import PageWrap from '../../../shared/components/PageWrap';
import {
  acceptDutchPayInviteLink,
  getDutchPaySession,
  type DutchPaySessionDetailResponse,
} from '../api/dutchPayApi';

type Props = NativeStackScreenProps<RootStackParamList, 'DutchPayInviteAccept'>;

function decodeInviteSessionId(inviteToken: string): number | null {
  try {
    const encodedPayload = decodeURIComponent(inviteToken).split('.')[0];
    const normalizedPayload = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(
      Math.ceil(normalizedPayload.length / 4) * 4,
      '=',
    );
    const atob = (globalThis as typeof globalThis & { atob?: (data: string) => string }).atob;

    if (!atob) {
      return null;
    }

    const decodedPayload = atob(paddedPayload);
    const sessionId = Number(decodedPayload.split(':')[0]);

    return Number.isFinite(sessionId) && sessionId > 0 ? sessionId : null;
  } catch {
    return null;
  }
}

function isAlreadyJoinedError(message: string): boolean {
  return (
    message.includes('이미') ||
    message.includes('DUTCH_DUPLICATED_PARTICIPANT') ||
    message.includes('DUTCH_PARTICIPANT_DUPLICATED') ||
    message.includes('DUPLICATED_PARTICIPANT')
  );
}

export default function DutchPayInviteAcceptScreen({ navigation, route }: Props) {
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const acceptInvite = async () => {
      try {
        const inviteToken = decodeURIComponent(route.params.inviteToken);
        const session = await acceptDutchPayInviteLink(inviteToken);
        const sessionId =
          (session as Partial<DutchPaySessionDetailResponse> | undefined)?.session_id ??
          decodeInviteSessionId(inviteToken);

        if (!isMounted) {
          return;
        }

        if (sessionId == null) {
          setErrorMessage('더치페이 세션 정보를 찾지 못했습니다. 초대 링크를 다시 확인해주세요.');
          return;
        }

        navigation.replace('DutchPayGroup', {
          role: 'PARTICIPANT',
          sessionId,
        });
      } catch (error) {
        if (isMounted) {
          const message =
            error instanceof Error
              ? error.message
              : '더치페이 초대 링크를 수락하지 못했습니다.';
          const sessionId = decodeInviteSessionId(route.params.inviteToken);

          if (sessionId != null && isAlreadyJoinedError(message)) {
            try {
              await getDutchPaySession(sessionId);

              if (!isMounted) {
                return;
              }

              navigation.replace('DutchPayGroup', {
                role: 'PARTICIPANT',
                sessionId,
              });
              return;
            } catch {
              // Keep the original accept error when the current user cannot read the session.
            }
          }

          setErrorMessage(message);
        }
      }
    };

    void acceptInvite();

    return () => {
      isMounted = false;
    };
  }, [navigation, route.params.inviteToken]);

  return (
    <PageWrap backgroundClassName="bg-neutral-white">
      <View className="flex-1 items-center justify-center px-5">
        <Text className="text-center font-pretendard text-heading-3 text-neutral-black1">
          더치페이 초대를 확인하고 있습니다.
        </Text>

        {errorMessage ? (
          <>
            <Text className="mt-4 text-center font-pretendard text-large-regular text-state-error">
              {errorMessage}
            </Text>
            <View className="mt-8 w-full">
              <Button label="메인으로 이동" onPress={() => navigation.replace('Main')} />
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
