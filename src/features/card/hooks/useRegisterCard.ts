import { useMutation } from '@tanstack/react-query';

import { registerCard } from '../api/cardApi';
import type { RegisterCardPayload } from '../types/card';

export function useRegisterCard() {
  return useMutation({
    mutationFn: (payload: RegisterCardPayload) => registerCard(payload),
  });
}
