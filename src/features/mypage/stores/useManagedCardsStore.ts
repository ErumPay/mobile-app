import { create } from 'zustand';

import type { ManagedCard } from '../types/mypage';

type AddCardInput = {
  id?: string;
  issuer?: string;
  name?: string;
  cardNumber: string;
  alias?: string;
  isDefault?: boolean;
};

type ManagedCardsState = {
  cards: ManagedCard[];
  setCards: (cards: ManagedCard[]) => void;
  addCard: (card: AddCardInput) => void;
  setDefaultCard: (cardId: string) => void;
  deleteCard: (cardId: string) => void;
  updateCardAlias: (cardId: string, alias: string) => void;
};

export const useManagedCardsStore = create<ManagedCardsState>((set) => ({
  cards: [],

  setCards: (cards) =>
    set({
      cards: keepSingleDefaultCard(cards),
    }),

  addCard: (card) =>
    set((state) => {
      const digits = card.cardNumber.replace(/\D/g, '');
      const last4 = digits.slice(-4) || '0000';
      const issuer = card.issuer ?? '카드사';

      return {
        cards: keepSingleDefaultCard([
          ...state.cards,
          {
            id: card.id ?? `card-${Date.now()}`,
            issuer,
            title: `${issuer} (${last4})`,
            name: card.name ?? '등록 카드',
            alias: card.alias?.trim() || '별칭미설정',
            cardNumber: card.cardNumber,
            registeredAt: formatToday(),
            colorClassName: 'bg-blue-700',
            isDefault: card.isDefault ?? state.cards.length === 0,
            hasPayments: false,
          },
        ]),
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
          ? { ...card, alias: alias.trim().slice(0, 10) || '별칭미설정' }
          : card,
      ),
    })),
}));

function keepSingleDefaultCard(cards: ManagedCard[]) {
  let hasDefaultCard = false;

  return cards.map((card) => {
    if (!card.isDefault) {
      return card;
    }

    if (hasDefaultCard) {
      return {
        ...card,
        isDefault: false,
      };
    }

    hasDefaultCard = true;
    return card;
  });
}

function formatToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, '0');
  const day = `${today.getDate()}`.padStart(2, '0');

  return `${year}.${month}.${day}`;
}
