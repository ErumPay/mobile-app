import {
    getPaymentUserId,
    PAYMENT_API_BASE_URL,
} from './paymentApiConfig';


const DUTCH_PAY_BASE_URL = `${PAYMENT_API_BASE_URL}/api/v1/dutch-pay`;
const DUTCH_PAY_API_TIMEOUT_MS = 8000;

export type DutchPayParticipantStatus =
    | 'INVITED'
    | 'JOINED'
    | 'PENDING'
    | 'PAID'
    | 'REJECTED'
    | 'TIMEOUT'
    | 'HOST_PAID';

export type DutchPaySessionStatus =
    | 'CREATED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'FAILED'
    | 'TIMEOUT_HANDLED'
    | 'CANCELED';

export type DutchPaySplitMethod = 'EQUAL' | 'CUSTOM';

export type DutchPaySessionProgressStep =
    | 'GROUP_CREATED'
    | 'PARTICIPANT_CONFIRM'
    | 'AMOUNT_INPUT'
    | 'AMOUNT_INPUT_COMPLETED'
    | 'AMOUNT_CONFIRMED'
    | 'PAYMENT_REQUEST'
    | 'PAYMENT_REQUESTED'
    | 'PAYMENT_IN_PROGRESS'
    | 'FINAL_PAYMENT_REQUIRED'
    | 'COMPLETED'
    | 'FAILED'
    | 'TIMEOUT_HANDLED'
    | 'CANCELED';

export type DutchPayParticipantResponse = {
    participant_id: number;
    user_id: number;
    amount: number | null;
    payment_id: number | null;
    status: DutchPayParticipantStatus;
    host: boolean;
};

export type DutchPaySessionDetailResponse = {
    session_id: number;
    dutch_order_no: string;
    order_name?: string;
    host_user_id: number;
    merchant_id: number;
    merchant_name: string;
    host_auth_payment_id: number | null;
    total_amount: number;
    remaining_amount: number;
    split_method: DutchPaySplitMethod;
    status: DutchPaySessionStatus;
    session_progress_step: DutchPaySessionProgressStep;
    participants: DutchPayParticipantResponse[];
    created_at?: string;
    createdAt?: string;
    timeout_at?: string | null;
    timeoutAt?: string | null;
    expires_at?: string;
    expiresAt?: string;
};

export type DutchPayMyPaymentResponse = {
    session_id: number;
    participant_id: number;
    user_id: number;
    host_user_id: number;
    merchant_id: number;
    merchant_name: string;
    amount: number;
    total_amount: number;
    split_method: DutchPaySplitMethod;
    session_status: DutchPaySessionStatus;
    participant_status: DutchPayParticipantStatus;
    payment_id: number | null;
    payable: boolean;
};

export type DutchPayInviteLinkResponse = {
    invite_token: string;
    invite_url: string;
};

export type DutchPayInviteNotificationResponse = {
    session_id: number;
    invite_token: string;
    invite_url: string;
    notified_user_ids: number[];
};

async function requestJson<T>(
    url: string,
    options: RequestInit = {},
    userId?: number | string,
): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DUTCH_PAY_API_TIMEOUT_MS);

    let response: Response;

    try {
        response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': String(userId ?? getPaymentUserId()),
                ...options.headers,
            },
        });
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('더치페이 서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.');
        }

        throw error;
    } finally {
        clearTimeout(timeoutId);
    }

    if (!response.ok) {
        let errorMessage = '더치페이 정보를 불러오지 못했습니다.';

        try {
            const errorBody = await response.json();
            const serverMessage =
                errorBody?.message ?? errorBody?.error ?? errorBody?.code;

            if (serverMessage) {
                errorMessage = String(serverMessage);
            }
        } catch {
            // Ignore malformed error bodies and keep the default message.
        }

        throw new Error(errorMessage);
    }

    const responseText = await response.text();

    if (!responseText) {
        return undefined as T;
    }

    return JSON.parse(responseText) as T;
}

export function getDutchPaySession(
    sessionId: number,
    userId?: number | string,
): Promise<DutchPaySessionDetailResponse> {
    return requestJson(`${DUTCH_PAY_BASE_URL}/sessions/${sessionId}`, {}, userId);
}

export function getActiveDutchPaySessions(
    userId?: number | string,
): Promise<DutchPaySessionDetailResponse[]> {
    return requestJson(`${DUTCH_PAY_BASE_URL}/sessions/active`, {}, userId);
}

export function inviteDutchPayAppFriends({
    sessionId,
    userIds,
    userId,
}: {
    sessionId: number;
    userIds: number[];
    userId?: number | string;
}): Promise<DutchPaySessionDetailResponse> {
    return requestJson(
        `${DUTCH_PAY_BASE_URL}/sessions/${sessionId}/invites`,
        {
            method: 'POST',
            body: JSON.stringify({
                user_ids: userIds,
            }),
        },
        userId,
    );
}

export function sendDutchPayInviteNotifications({
    sessionId,
    userIds,
    userId,
}: {
    sessionId: number;
    userIds: number[];
    userId?: number | string;
}): Promise<DutchPayInviteNotificationResponse> {
    return requestJson(
        `${DUTCH_PAY_BASE_URL}/sessions/${sessionId}/invite-notifications`,
        {
            method: 'POST',
            body: JSON.stringify({
                user_ids: userIds,
            }),
        },
        userId,
    );
}

export function createDutchPayInviteLink(
    sessionId: number,
    userId?: number | string,
): Promise<DutchPayInviteLinkResponse> {
    return requestJson(
        `${DUTCH_PAY_BASE_URL}/sessions/${sessionId}/invite-links`,
        {
            method: 'POST',
        },
        userId,
    );
}

export function acceptDutchPayInviteLink(
    inviteToken: string,
    userId?: number | string,
): Promise<DutchPaySessionDetailResponse> {
    return requestJson(
        `${DUTCH_PAY_BASE_URL}/invite-links/${inviteToken}/accept`,
        {
            method: 'POST',
        },
        userId,
    );
}

export function joinDutchPayInvitedParticipant(
    sessionId: number,
    userId?: number | string,
): Promise<DutchPaySessionDetailResponse> {
    return requestJson(
        `${DUTCH_PAY_BASE_URL}/sessions/${sessionId}/participants/join`,
        {
            method: 'POST',
        },
        userId,
    );
}

export function confirmDutchPayParticipants({
    sessionId,
    splitMethod,
    userId,
}: {
    sessionId: number;
    splitMethod?: DutchPaySplitMethod;
    userId?: number | string;
}): Promise<DutchPaySessionDetailResponse> {
    return requestJson(
        `${DUTCH_PAY_BASE_URL}/sessions/${sessionId}/participants/confirm`,
        {
            method: 'POST',
            body: JSON.stringify({
                split_method: splitMethod,
            }),
        },
        userId,
    );
}

export function updateDutchPaySplitMethod({
    sessionId,
    splitMethod,
    userId,
}: {
    sessionId: number;
    splitMethod: DutchPaySplitMethod;
    userId?: number | string;
}): Promise<DutchPaySessionDetailResponse> {
    return requestJson(
        `${DUTCH_PAY_BASE_URL}/sessions/${sessionId}/split-method`,
        {
            method: 'PATCH',
            body: JSON.stringify({
                split_method: splitMethod,
            }),
        },
        userId,
    );
}

export function updateDutchPayMyAmount({
    sessionId,
    amount,
    userId,
}: {
    sessionId: number;
    amount: number;
    userId?: number | string;
}): Promise<DutchPaySessionDetailResponse> {
    return requestJson(
        `${DUTCH_PAY_BASE_URL}/sessions/${sessionId}/my-amount`,
        {
            method: 'PATCH',
            body: JSON.stringify({
                amount,
            }),
        },
        userId,
    );
}

export function confirmDutchPayAmount({
    sessionId,
    userId,
}: {
    sessionId: number;
    userId?: number | string;
}): Promise<DutchPaySessionDetailResponse> {
    return requestJson(
        `${DUTCH_PAY_BASE_URL}/sessions/${sessionId}/amount-confirm`,
        {
            method: 'POST',
        },
        userId,
    );
}

export function requestDutchPayPayment({
    sessionId,
    userId,
}: {
    sessionId: number;
    userId?: number | string;
}): Promise<DutchPaySessionDetailResponse> {
    return requestJson(
        `${DUTCH_PAY_BASE_URL}/sessions/${sessionId}/payment-request`,
        {
            method: 'POST',
        },
        userId,
    );
}

export function rejectDutchPayInvite(
    sessionId: number,
    userId?: number | string,
): Promise<DutchPaySessionDetailResponse> {
    return requestJson(
        `${DUTCH_PAY_BASE_URL}/sessions/${sessionId}/reject`,
        {
            method: 'POST',
        },
        userId,
    );
}

export function cancelDutchPaySession(
    sessionId: number,
    userId?: number | string,
): Promise<DutchPaySessionDetailResponse> {
    return requestJson(
        `${DUTCH_PAY_BASE_URL}/sessions/${sessionId}/cancel`,
        {
            method: 'POST',
        },
        userId,
    );
}

export function removeDutchPayParticipant({
    sessionId,
    participantUserId,
    userId,
}: {
    sessionId: number;
    participantUserId: number;
    userId?: number | string;
}): Promise<DutchPaySessionDetailResponse> {
    return requestJson(
        `${DUTCH_PAY_BASE_URL}/sessions/${sessionId}/participants/${participantUserId}`,
        {
            method: 'DELETE',
        },
        userId,
    );
}

export function getDutchPayMyPayment(
    sessionId: number,
    userId?: number | string,
): Promise<DutchPayMyPaymentResponse> {
    return requestJson(
        `${DUTCH_PAY_BASE_URL}/sessions/${sessionId}/my-payment`,
        {},
        userId,
    );
}
