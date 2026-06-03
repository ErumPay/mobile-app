export type PaymentMethodType = 'remote' | 'dutchpay' | 'solo';

export type PaymentBenefitType =
  | 'singleBenefit'
  | 'singlePerformance'
  | 'splitBenefit'
  | 'splitPerformance';

export type ManagedCard = {
  id: string;
  issuer: string;
  title: string;
  name: string;
  alias: string;
  cardNumber: string;
  registeredAt: string;
  colorClassName: string;
  isDefault: boolean;
  disabled?: boolean;
  hasPayments?: boolean;
};

export type UserProfile = {
  name: string;
  maskedId: string;
  phone: string;
  birthDate: string;
};

export type PaymentStatus = 'completed' | 'canceled' | 'cancelRequested';

export type PaymentHistoryItem = {
  id: string;
  cardId: string;
  method: PaymentMethodType;
  benefitType: PaymentBenefitType;
  status: PaymentStatus;
  title: string;
  date: string;
  amount: string;
};

export type PaymentDetail = PaymentHistoryItem & {
  paidAt: string;
  receiptId: string;
  sellerName: string;
  businessNumber: string;
  address: string;
  ownerName: string;
  phone: string;
  productAmount: string;
  discountAmount: string;
  tax: string;
  finalAmount: string;
};

export type CardBenefit = {
  title: string;
  description: string;
};


