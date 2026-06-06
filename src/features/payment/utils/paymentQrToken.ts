const TOKEN_QUERY_KEYS = ['token', 'qrToken', 'paymentToken'];
const PAYMENT_QR_TOKEN_PATTERN = /[a-fA-F0-9]{32}$/;

function safeDecodeURIComponent(value: string) {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

function getQueryToken(value: string) {
    const queryStartIndex = value.indexOf('?');

    if (queryStartIndex < 0) {
        return '';
    }

    const hashStartIndex = value.indexOf('#', queryStartIndex);
    const queryString = value.slice(
        queryStartIndex + 1,
        hashStartIndex < 0 ? undefined : hashStartIndex,
    );

    for (const param of queryString.split('&')) {
        const [rawKey, rawValue = ''] = param.split('=');
        const key = safeDecodeURIComponent(rawKey);

        if (TOKEN_QUERY_KEYS.includes(key)) {
            return safeDecodeURIComponent(rawValue).trim();
        }
    }

    return '';
}

function getLastPathSegment(value: string) {
    const [withoutHash] = value.split('#');
    const [withoutQuery] = withoutHash.split('?');
    const segments = withoutQuery.split('/').filter(Boolean);

    return segments.at(-1)?.trim() ?? '';
}

export function normalizePaymentQrToken(value: string) {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
        return '';
    }

    const queryToken = getQueryToken(trimmedValue);

    if (queryToken) {
        return queryToken;
    }

    const hexToken = trimmedValue.match(PAYMENT_QR_TOKEN_PATTERN)?.[0];

    if (hexToken) {
        return hexToken;
    }

    return safeDecodeURIComponent(
        getLastPathSegment(trimmedValue) || trimmedValue,
    ).trim();
}
