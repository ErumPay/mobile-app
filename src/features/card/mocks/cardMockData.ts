import type { CardRegisterFormValues, RegisteredCard } from '../types/card';

export const initialCardRegisterFormValues: CardRegisterFormValues = {
  cardNumber: '',
  expiry: '',
  cvc: '',
  passwordFirstTwo: '',
  birthDate: '',
  cardNickname: '',
};

export const mockRegisteredCard: RegisteredCard = {
  id: 'card-1',
  issuer: 'SHINHAN',
  last4: '1234',
  holderName: '조이름',
  cardNickname: '별칭미설정',
  isDefault: false,
  createdAt: '2026.05.29',
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