import * as Sentry from '@sentry/nextjs';
import { useMutation } from '@tanstack/react-query';

import { logout, withdraw } from '@/lib/api/auth';
import { useAuthStore } from '@/store/use-auth-store';

export function useLogoutMutation() {
  const clear = useAuthStore((state) => state.clear);

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clear();
    },
    onError: (error) => {
      Sentry.captureException(error);
      clear();
    },
  });
}

export function useWithdrawMutation() {
  const clear = useAuthStore((state) => state.clear);

  return useMutation({
    mutationFn: withdraw,
    onSuccess: () => {
      clear();
    },
    onError: (error) => {
      Sentry.captureException(error);
    },
  });
}
