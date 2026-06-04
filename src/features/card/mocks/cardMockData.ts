import type {
  CardRegisterFormValues,
  OcrCardResult,
  RegisteredCard,
} from '../types/card';

export const initialCardRegisterFormValues: CardRegisterFormValues = {
  cardNumber: '',
  expiry: '',
  cvc: '',
  passwordFirstTwo: '',
  birthDate: '',
  cardNickname: '',
};

export const mockRegisteredCard: RegisteredCard = {
  cardId: 1,
  cardProductId: 1,
  cardCompany: 'SHINHAN',
  cardName: 'Deep Dream 카드',
  maskedNumber: '**** **** **** 1234',
  cardAlias: '별칭미설정',
  expiryYm: '202805',
  isDefault: false,
  status: 'ACTIVE',
};

export const mockOcrCard = {
  issuer: '신한카드',
  name: 'Deep Dream 카드',
  number: '1234-5556-2432-5678',
};

export const mockCardRegisterResult = {
  issuer: '신한카드',
  name: 'Deep Dream 카드',
  registeredAt: '2026.05.11',
};

export const mockOcrResult: OcrCardResult = {
  cardNumber: '1234555624325678',
  expiry: '05/28',
};
