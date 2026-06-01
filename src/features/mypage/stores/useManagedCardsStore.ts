import { create } from 'zustand';

import { mockManagedCards } from '../mocks/mypageMockData';
import type { ManagedCard } from '../types/mypage';

type AddCardInput = {
  issuer?: string;
  name?: string;
  cardNumber: string;
  alias?: string;
};

type ManagedCardsState = {
  cards: ManagedCard[];
  addCard: (card: AddCardInput) => void;
  setDefaultCard: (cardId: string) => void;
  deleteCard: (cardId: string) => void;
  updateCardAlias: (cardId: string, alias: string) => void;
};

export const useManagedCardsStore = create<ManagedCardsState>((set) => ({
  cards: mockManagedCards,

  addCard: (card) =>
    set((state) => {
      const digits = card.cardNumber.replace(/\D/g, '');
      const last4 = digits.slice(-4) || '0000';
      const issuer = card.issuer ?? '신한카드';

      return {
        cards: [
          ...state.cards,
          {
            id: `card-${Date.now()}`,
            issuer,
            title: `${issuer} (${last4})`,
            name: card.name ?? '등록 카드',
            alias: card.alias?.trim() || '별칭미설정',
            cardNumber: `**** **** **** ${last4}`,
            registeredAt: formatToday(),
            colorClassName: 'bg-blue-700',
            isDefault: state.cards.length === 0,
            hasPayments: false,
          },
        ],
      };
    }),

  setDefaultCard: (cardId) =>
    set((state) => {
      const targetCard = state.cards.find((card) => card.id === cardId);

      if (!targetCard) {
        return state;
      }

      return {
        cards: state.cards.map((card) => ({
          ...card,
          isDefault: card.id === cardId,
        })),
      };
    }),

  deleteCard: (cardId) =>
    set((state) => {
      const deletedCard = state.cards.find((card) => card.id === cardId);
      const nextCards = state.cards.filter((card) => card.id !== cardId);

      if (!deletedCard?.isDefault || nextCards.length === 0) {
        return { cards: nextCards };
      }

      return {
        cards: nextCards.map((card, index) => ({
          ...card,
          isDefault: index === 0,
        })),
      };
    }),

  updateCardAlias: (cardId, alias) =>
    set((state) => ({
      cards: state.cards.map((card) =>
        card.id === cardId
          ? { ...card, alias: alias.trim() || '별칭미설정' }
          : card
      ),
    })),
}));

function formatToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, '0');
  const day = `${today.getDate()}`.padStart(2, '0');

  return `${year}.${month}.${day}`;
}