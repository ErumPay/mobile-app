import type {
    PaymentActionOption,
    PaymentRequestType,
} from '../types/paymentMethod.types';

export function getPaymentActionOptions(
    type: PaymentRequestType,
): PaymentActionOption[] {
    if (type === 'REMOTE_RECIPIENT') {
        return [
            {
                type: 'PAY',
                title: '결제하기',
                description: '혼자 결제를 진행합니다',
            },
            {
                type: 'REJECT',
                title: '거절하기',
                description: '결제 요청을 거절합니다',
            },
        ];
    }

    if (type === 'ONLINE') {
        return [
            {
                type: 'PAY',
                title: '결제하기',
                description: '혼자 결제를 진행합니다',
            },
            {
                type: 'REMOTE_REQUEST',
                title: '원격결제 요청하기',
                description: '다른 사람에게 결제를 요청합니다',
            },
        ];
    }

    if (type === 'DUTCH_PAY_PARTICIPANT') {
        return [
            {
                type: 'PAY',
                title: '결제하기',
                description: '더치페이 결제를 진행합니다',
            },
        ];
    }

    return [
        {
            type: 'PAY',
            title: '결제하기',
            description: '혼자 결제를 진행합니다',
        },
        {
            type: 'DUTCH_PAY',
            title: '더치페이하기',
            description: '친구들과 함께 나눠서 결제합니다',
        },
    ];
}