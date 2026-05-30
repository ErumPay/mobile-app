import type { PaymentCardTheme } from '../types/paymentCard.types';

export const getPaymentCardClassName = (theme: PaymentCardTheme): string => {
    switch (theme) {
        case 'ORANGE':
            return 'bg-[#FFA31A]';
        case 'PURPLE':
            return 'bg-[#5B45E8]';
        case 'BLUE':
        default:
            return 'bg-[#3E82BA]';
    }
};

export const getPaymentCardLogoClassName = (theme: PaymentCardTheme): string => {
    switch (theme) {
        case 'ORANGE':
            return 'bg-[#FFC267]';
        case 'PURPLE':
            return 'bg-[#7B68F2]';
        case 'BLUE':
        default:
            return 'bg-[#6BA7DA]';
    }
};