import type { CardIssuer } from './card';

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatCardNumber(value: string): string {
  return onlyDigits(value).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function formatExpiry(value: string): string {
  const digits = onlyDigits(value).slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function maskCardNumber(value: string): string {
  const digits = onlyDigits(value).padEnd(16, '*');
  return `${digits.slice(0, 4)}  ****  ****  ${digits.slice(12, 16)}`;
}

export function detectCardIssuer(cardNumber: string): CardIssuer {
  const digits = onlyDigits(cardNumber);

  if (digits.startsWith('356') || digits.startsWith('404')) return 'BC';
  if (digits.startsWith('3562') || digits.startsWith('5409')) return 'KB';
  if (digits.startsWith('4518') || digits.startsWith('4854')) return 'SHINHAN';
  if (digits.startsWith('3791') || digits.startsWith('5520')) return 'SAMSUNG';
  if (digits.startsWith('4028') || digits.startsWith('5243')) return 'HYUNDAI';
  if (digits.startsWith('3763') || digits.startsWith('5188')) return 'LOTTE';
  if (digits.startsWith('3747') || digits.startsWith('4599')) return 'HANA';
  if (digits.startsWith('4063') || digits.startsWith('4445')) return 'WOORI';
  if (digits.startsWith('3569') || digits.startsWith('9410')) return 'NH';

  return 'UNKNOWN';
}

export function getIssuerLabel(issuer: CardIssuer): string {
  const labels: Record<CardIssuer, string> = {
    BC: 'BC',
    KB: 'KB Kookmin',
    SHINHAN: 'Shinhan',
    SAMSUNG: 'Samsung',
    HYUNDAI: 'Hyundai',
    LOTTE: 'Lotte',
    HANA: 'Hana',
    WOORI: 'Woori',
    NH: 'NH',
    UNKNOWN: 'Erum Card',
  };

  return labels[issuer];
}

export function isValidExpiry(value: string): boolean {
  const [month, year] = value.split('/');
  const monthNumber = Number(month);
  const yearNumber = Number(year);

  if (!month || !year || month.length !== 2 || year.length !== 2) return false;
  if (monthNumber < 1 || monthNumber > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  if (yearNumber < currentYear) return false;
  if (yearNumber === currentYear && monthNumber < currentMonth) return false;

  return true;
}
