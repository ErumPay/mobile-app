import Constants from 'expo-constants';

function getDevHost(): string {
    const debuggerHost =
        Constants.expoGoConfig?.debuggerHost ?? (Constants as any).manifest?.debuggerHost;
    if (debuggerHost) {
        return debuggerHost.split(':')[0];
    }
    return 'localhost';
}

const MERCHANT_API_BASE_URL =
    process.env.EXPO_PUBLIC_MERCHANT_API_BASE_URL ??
    (__DEV__ ? `http://${getDevHost()}:8094` : undefined);

type MerchantResponse = {
    merchantId?: number;
    merchant_id?: number;
    merchantName?: string;
    merchant_name?: string;
};

export async function fetchMerchantName(merchantId: number): Promise<string> {
    if (!MERCHANT_API_BASE_URL) {
        throw new Error('가맹점 API 설정이 필요합니다.');
    }

    const response = await fetch(`${MERCHANT_API_BASE_URL}/internal/v1/merchants/${merchantId}`);

    if (!response.ok) {
        throw new Error('가맹점 정보를 불러오지 못했습니다.');
    }

    const data = (await response.json()) as MerchantResponse;
    const merchantName = data.merchantName ?? data.merchant_name;

    if (!merchantName) {
        throw new Error('가맹점명이 없습니다.');
    }

    return merchantName;
}
