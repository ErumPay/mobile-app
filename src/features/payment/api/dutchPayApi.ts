import {
    getPaymentUserId,
    PAYMENT_API_BASE_URL,
} from './paymentApiConfig';


const DUTCH_PAY_BASE_URL = `${PAYMENT_API_BASE_URL}/api/v1/dutch-pay`;

export type DutchPayParticipantStatus =
    | 'INVITED'
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
    | 'TIMEOUT_HANDLED';

export type DutchPaySplitMethod = 'EQUAL' | 'CUSTOM';

export type DutchPaySessionProgressStep =
    | 'GROUP_CREATED'
    | 'PARTICIPANT_CONFIRM'
    | 'AMOUNT_INPUT'
    | 'PAYMENT_REQUEST'
    | 'PAYMENT_IN_PROGRESS'
    | 'FINAL_PAYMENT_REQUIRED'
    | 'COMPLETED'
    | 'FAILED'
    | 'TIMEOUT_HANDLED';

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

async function requestJson<T>(
    url: string,
    options: RequestInit = {},
    userId?: number | string,
): Promise<T> {
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'X-User-Id': String(userId ?? getPaymentUserId()),
            ...options.headers,
        },
    });

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

    return response.json();
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
