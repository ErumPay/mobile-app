이건 `KAN-1348` 전체를 살리는 게 맞아. develop 쪽 `payment-prepare-${paymentId}`는 고정 문자열이라 멱등성 키 충돌 가능성이 있고, 결제 요청/취소 요청 키를 나눌 수도 없어.

수정 포인트:

- `KAN-1348`의 ULID 생성 로직 전체 유지
- `createPaymentIdempotencyKey`
- `createPaymentCancelIdempotencyKey`
- develop 쪽 `payment-prepare-${paymentId}` 제거

최종 코드:

```ts
const ULID_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const ULID_TIME_LENGTH = 10;
const ULID_RANDOM_LENGTH = 16;

function encodeTime(time: number): string {
    let currentTime = time;
    const chars = Array.from({ length: ULID_TIME_LENGTH }, () => '0');

    for (let index = ULID_TIME_LENGTH - 1; index >= 0; index -= 1) {
        chars[index] = ULID_ALPHABET[currentTime % 32];
        currentTime = Math.floor(currentTime / 32);
    }

    return chars.join('');
}

function getRandomIndex(): number {
    const cryptoObject = (globalThis as unknown as {
        crypto?: {
            getRandomValues?: (array: Uint8Array) => Uint8Array;
        };
    }).crypto;

    if (cryptoObject?.getRandomValues) {
        const randomValues = new Uint8Array(1);
        cryptoObject.getRandomValues(randomValues);

        return randomValues[0] % 32;
    }

    return Math.floor(Math.random() * 32);
}

function encodeRandom(): string {
    return Array.from(
        { length: ULID_RANDOM_LENGTH },
        () => ULID_ALPHABET[getRandomIndex()],
    ).join('');
}

export function createUlid(): string {
    return `${encodeTime(Date.now())}${encodeRandom()}`;
}

export function createPaymentIdempotencyKey(paymentId: number): string {
    return `pay:payment:${paymentId}:${createUlid()}`;
}

export function createPaymentCancelIdempotencyKey(paymentId: number): string {
    return `pay:cancel:${paymentId}:${createUlid()}`;
}
```