import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../../App';
import Button from '../../../shared/components/Button';
import { Header } from '../../../shared/components/Header';
import NoticeBox from '../../../shared/components/NoticeBox';
import PageWrap from '../../../shared/components/PageWrap';
import { colors } from '../../../shared/styles/designTokens';
import type {
    PaymentResultFlow,
    PaymentResultStatus,
} from '../types/paymentResult.types';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentResult'>;

type PaymentResultContent = {
    title: string;
    description: string;
    buttonLabel: string;
    iconType: PaymentResultStatus;
    notice?: string;
    linkLabel?: string;
    buttonAction: 'MAIN' | 'CARD_SELECT' | 'CREATE_GROUP';
    noticeTone?: 'info' | 'success' | 'warning' | 'error';
    linkAction?: 'MAIN' | 'RECEIPT';
};

function getPaymentResultContent({
                                     status,
                                     flow,
                                 }: {
    status: PaymentResultStatus;
    flow: PaymentResultFlow;
}): PaymentResultContent {
    if (status === 'FAILURE') {
        return {
            title: '결제에 실패했어요.',
            description: '카드 정보 또는 네트워크 상태를 확인한 뒤,\n다시 시도해주세요.',
            buttonLabel: '카드 다시 선택하기',
            iconType: 'FAILURE',
            buttonAction: 'CARD_SELECT',
            linkLabel: flow === 'NORMAL' ? '메인으로 가기' : undefined,
            linkAction: flow === 'NORMAL' ? 'MAIN' : undefined,
        };
    }

    if (flow === 'DUTCH_PAY_PRE_AUTH') {
        return {
            title: '결제가 완료되었습니다!',
            description: '이제 그룹을 만들어 더치페이를 시작해보세요.',
            buttonLabel: '그룹 생성하기',
            iconType: 'SUCCESS',
            buttonAction: 'CREATE_GROUP',
            notice: '30분 내 더치페이 결제가 완료되지 않으면,\n대표자의 주카드로 결제돼요.',
            noticeTone: 'warning',
        };
    }

    if (flow === 'DUTCH_PAY_FINAL') {
        return {
            title: '결제가 완료되었습니다!',
            description: '마이페이지에서 결제 내역을 확인해보세요.',
            buttonLabel: '메인으로 가기',
            iconType: 'SUCCESS',
            buttonAction: 'MAIN',
            linkLabel: '전자영수증 보러가기',
            linkAction: 'RECEIPT',
            notice: '가결제는 취소 되었습니다.',
            noticeTone: 'warning',
        };
    }

    return {
        title: '결제가 완료되었습니다!',
        description: '마이페이지에서 결제 내역을 확인해보세요.',
        buttonLabel: '메인으로 가기',
        iconType: 'SUCCESS',
        buttonAction: 'MAIN',
        linkLabel: '전자영수증 보러가기',
        linkAction: 'RECEIPT',
    };
}

function ResultIcon({ type }: { type: PaymentResultStatus }) {
    const isSuccess = type === 'SUCCESS';
    const iconColor = isSuccess ? colors.state.success : colors.state.error;
    const iconName = isSuccess ? 'check' : 'x';

    return (
        <View
            className="aspect-square w-[20%] min-w-16 max-w-20 items-center justify-center rounded-full border-[6px]"
            style={{ borderColor: iconColor }}
        >
            <Feather name={iconName} size={36} color={iconColor} />
        </View>
    );
}

export default function PaymentResultScreen({ navigation, route }: Props) {
    const status = route.params?.status ?? 'SUCCESS';
    const flow = route.params?.flow ?? 'NORMAL';

    const content = getPaymentResultContent({ status, flow });

    const handlePressClose = () => {
        navigation.navigate('Main');
    };

    const handlePressButton = () => {
        if (content.buttonAction === 'CARD_SELECT') {
            navigation.navigate('PaymentCardSelect');
            return;
        }

        if (content.buttonAction === 'CREATE_GROUP') {
            if (!route.params?.dutchSessionId) {
                Alert.alert('더치페이', '더치페이 세션 정보가 없습니다.');
                return;
            }

            navigation.navigate('PaymentParticipantSelect', {
                mode: 'DUTCH_PAY',
                scenario: 'DEFAULT',
                dutchSessionId: route.params.dutchSessionId,
                orderName: route.params.orderName,
                merchantId: route.params.merchantId,
            });
            return;
        }

        navigation.navigate('Main');
    };

    const handlePressLink = () => {
        if (content.linkAction === 'RECEIPT') {
            Alert.alert('전자영수증', '전자영수증 화면으로 이동합니다.');
            return;
        }

        navigation.navigate('Main');
    };

    return (
        <PageWrap
            scroll={false}
            padded={false}
            backgroundClassName="bg-neutral-white"
        >
            <View className="absolute left-0 right-0 top-0 z-10">
                <Header title="" type="close" onPressRight={handlePressClose} />
            </View>

            <ScrollView
                className="flex-1"
                contentContainerClassName="flex-grow px-4 pb-8 pt-16"
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View className="flex-1 justify-center">
                    <View className="w-full max-w-sm self-center">
                        {content.notice ? (
                            <View className="mb-10 items-center">
                                <NoticeBox tone={content.noticeTone ?? 'info'} description={content.notice} />
                            </View>
                        ) : null}

                        <View className="items-center">
                            <ResultIcon type={content.iconType} />

                            <Text className="mt-8 text-center font-pretendard text-heading-2 text-neutral-black1">
                                {content.title}
                            </Text>

                            <Text className="mt-3 text-center font-pretendard text-large-regular text-neutral-black2">
                                {content.description}
                            </Text>

                            {content.linkLabel ? (
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel={content.linkLabel}
                                    className="mt-8 rounded-md px-3 py-2"
                                    hitSlop={8}
                                    onPress={handlePressLink}
                                >
                                    <Text className="font-pretendard text-normal-bold text-neutral-black2 underline">
                                        {content.linkLabel}
                                    </Text>
                                </Pressable>
                            ) : null}

                            <View className="mt-4 w-full">
                                <Button
                                    label={content.buttonLabel}
                                    size="large"
                                    onPress={handlePressButton}
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </PageWrap>
    );
}
