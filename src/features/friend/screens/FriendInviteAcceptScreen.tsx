import { useEffect, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../../App';
import Button from '../../../shared/components/Button';
import Header from '../../../shared/components/Header';
import PageWrap from '../../../shared/components/PageWrap';
import { acceptFriendInviteLink } from '../api/friendApi';

type Props = NativeStackScreenProps<RootStackParamList, 'FriendInviteAccept'>;

export default function FriendInviteAcceptScreen({ navigation, route }: Props) {
  const [errorMessage, setErrorMessage] = useState('');
  const [isAccepted, setIsAccepted] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const acceptInvite = async () => {
      try {
        await acceptFriendInviteLink(route.params.inviteToken);

        if (isMounted) {
          setIsAccepted(true);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error ? error.message : '친구 초대 링크를 수락하지 못했습니다.',
          );
        }
      }
    };

    void acceptInvite();

    return () => {
      isMounted = false;
    };
  }, [route.params.inviteToken]);

  const handleGoFriendList = () => {
    navigation.replace('FriendListScreen');
  };

  const handleGoMain = () => {
    navigation.replace('Main');
  };

  return (
    <PageWrap
      backgroundClassName="bg-neutral-white"
      header={<Header title="친구 초대" type="close" onPressRight={handleGoMain} />}
    >
      <View className="flex-1 items-center justify-center px-5 py-12">
        <View
          className={`h-24 w-24 items-center justify-center rounded-full ${
            errorMessage ? 'bg-state-error' : isAccepted ? 'bg-erum-main' : 'bg-neutral-grey2'
          }`}
        >
          <Feather
            name={errorMessage ? 'x' : isAccepted ? 'check' : 'link'}
            size={42}
            color={errorMessage || isAccepted ? '#FFFFFF' : '#2FAB84'}
          />
        </View>

        <Text className="mt-8 text-center font-pretendard text-heading-2 text-neutral-black1">
          {errorMessage
            ? '친구 추가에 실패했어요.'
            : isAccepted
              ? '친구 추가가 완료됐어요.'
              : '친구 초대를 확인하고 있어요.'}
        </Text>

        <Text className="mt-3 text-center font-pretendard text-large-regular text-neutral-black2">
          {errorMessage || (isAccepted ? '친구 목록에서 추가된 친구를 확인할 수 있어요.' : '잠시만 기다려주세요.')}
        </Text>

        {errorMessage || isAccepted ? (
          <View className="mt-10 w-full gap-3">
            {isAccepted ? <Button label="친구 목록으로 이동" size="large" onPress={handleGoFriendList} /> : null}
            <Button
              label="메인으로 이동"
              variant={isAccepted ? 'secondary' : 'primary'}
              size="large"
              onPress={handleGoMain}
            />
          </View>
        ) : null}
      </View>
    </PageWrap>
  );
}
