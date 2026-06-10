export function formatCurrency(value: number) {
  return `${Math.trunc(value).toLocaleString('ko-KR')}원`;
}
