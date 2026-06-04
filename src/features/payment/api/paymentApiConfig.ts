export const PAYMENT_API_BASE_URL =
    process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export function getPaymentUserId(): string {
    if (__DEV__) {
        return process.env.EXPO_PUBLIC_DEV_USER_ID ?? '1';
    }

    throw new Error('결제 사용자 정보 연동이 필요합니다.');
}
