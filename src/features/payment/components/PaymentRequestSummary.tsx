import { Text, View } from 'react-native';

import type { PaymentRequestSummary as PaymentRequestSummaryType } from '../types/paymentMethod.types';

type Props = {
    summary: PaymentRequestSummaryType;
};

export default function PaymentRequestSummary({ summary }: Props) {
    return (
        <View className="px-4 pt-7">
            <Text className="font-pretendard text-heading-3 text-neutral-black1">
                {summary.merchantName}에서
            </Text>
            <Text className="mt-1 font-pretendard text-heading-3 text-neutral-black1">
                {summary.amount.toLocaleString()}원이 결제 됩니다.
            </Text>

            {summary.type === 'REMOTE_RECIPIENT' && summary.requesterName ? (
                <Text className="mt-4 font-pretendard text-normal-regular text-neutral-black2">
                    원격결제 요청자 :{' '}
                    <Text className="font-pretendard text-normal-bold text-neutral-black1">
                        {summary.requesterName}
                    </Text>
                </Text>
            ) : null}

            {summary.type === 'DUTCH_PAY_PARTICIPANT' && summary.dutchPayOwnerName ? (
                <Text className="mt-4 font-pretendard text-normal-regular text-neutral-black2">
                    더치페이 대표자 :{' '}
                    <Text className="font-pretendard text-normal-bold text-neutral-black1">
                        {summary.dutchPayOwnerName}
                    </Text>
                </Text>
            ) : null}
        </View>
    );
}