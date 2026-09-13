import { useMutation } from '@tanstack/react-query';

import { agreeTerms } from '@/lib/api/user';

export const userKeys = {
  all: ['users'] as const,
};

export function useAgreeTermsMutation() {
  return useMutation({
    mutationFn: agreeTerms,
  });
}
