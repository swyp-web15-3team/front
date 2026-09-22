import * as Sentry from '@sentry/nextjs';
import { useMutation } from '@tanstack/react-query';

import { logout, signUp, withdraw } from '@/lib/api/auth';
import { useAuthStore } from '@/store/use-auth-store';

export function useSignUpMutation() {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  return useMutation({
    mutationFn: signUp,
    onSuccess: ({ accessToken }) => {
      setAccessToken(accessToken);
    },
    onError: (error) => {
      Sentry.captureException(error);
    },
  });
}

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
