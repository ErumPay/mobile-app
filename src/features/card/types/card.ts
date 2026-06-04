export type CardIssuer =
  | 'BC'
  | 'KB'
  | 'SHINHAN'
  | 'SAMSUNG'
  | 'HYUNDAI'
  | 'LOTTE'
  | 'HANA'
  | 'WOORI'
  | 'NH'
  | 'UNKNOWN';

export interface CardRegisterFormValues {
  cardNumber: string;
  expiry: string;
  cvc: string;
  passwordFirstTwo: string;
  birthDate: string;
  cardNickname: string;
}

export interface RegisterCardPayload {
  userId: number;
  cardNumber: string;
  expiryYm: string;
  cvc: string;
  cardPassword2: string;
  cardAlias?: string;
  isDefault?: boolean;
}

export interface RegisteredCard {
  cardId: number;
  cardProductId: number;
  cardCompany: string;
  cardName: string;
  maskedNumber: string;
  cardAlias?: string | null;
  expiryYm: string;
  isDefault: boolean;
  status: string;
}

export interface OcrCardResult {
  cardNumber: string;
  expiry: string;
}
