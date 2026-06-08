import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../../App';
import Button from '../../../shared/components/Button';
import PageWrap from '../../../shared/components/PageWrap';
import { acceptDutchPayInviteLink } from '../api/dutchPayApi';

type Props = NativeStackScreenProps<RootStackParamList, 'DutchPayInviteAccept'>;

export default function DutchPayInviteAcceptScreen({ navigation, route }: Props) {
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const acceptInvite = async () => {
      try {
        const session = await acceptDutchPayInviteLink(route.params.inviteToken);

        if (!isMounted) {
          return;
        }

        navigation.replace('DutchPayGroup', {
          role: 'PARTICIPANT',
          sessionId: session.session_id,
        });
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : '더치페이 초대 링크를 수락하지 못했습니다.',
          );
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
