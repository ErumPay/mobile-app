import { create } from 'zustand';

type DutchPayProgressUserState = {
  userId?: number;
  setUserId: (userId: number) => void;
  clearUserId: () => void;
};

export const useDutchPayProgressUserStore = create<DutchPayProgressUserState>(
  (set) => ({
    userId: undefined,
    setUserId: (userId) => set({ userId }),
    clearUserId: () => set({ userId: undefined }),
  }),
);
