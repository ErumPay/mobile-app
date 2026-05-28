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
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
  passwordFirstTwo: string;
  birthDate: string;
  cardNickname?: string;
}

export interface RegisteredCard {
  id: string;
  last4: string;
  issuer: CardIssuer;
  holderName: string;
  cardNickname?: string;
  isDefault: boolean;
  createdAt: string;
}
