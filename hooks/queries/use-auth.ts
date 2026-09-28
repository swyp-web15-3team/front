import * as Sentry from '@sentry/nextjs';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

import { logout, signUp, withdraw } from '@/lib/api/auth';
import { readPendingAccessToken, useAuthStore } from '@/store/use-auth-store';

/** 백엔드가 "이미 가입이 완료된 사용자입니다"로 주는 코드. 실패가 아니라 이미 끝난 가입이다. */
const ALREADY_SIGNED_UP = 'AUTH_002';

/** 중복 제출 등으로 가입이 이미 끝난 경우. 에러로 보지 않고 로그인 상태로 이어간다. */
export function isAlreadySignedUp(error: unknown): boolean {
  return (
    axios.isAxiosError(error) &&
    error.response?.data?.code === ALREADY_SIGNED_UP
  );
}

export function useSignUpMutation() {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  return useMutation({
    mutationFn: signUp,
    // signUp이 돌려주는 건 카카오 로그인 때 받아둔 pending 토큰이다.
    // 여기서 setAccessToken으로 승격하면 정식 로그인 상태가 된다.
    onSuccess: (accessToken) => {
      setAccessToken(accessToken);
    },
    onError: (error) => {
      // 이미 가입된 사용자는 들고 있던 토큰으로 그대로 로그인시킨다.
      if (isAlreadySignedUp(error)) {
        const pending =
          useAuthStore.getState().accessToken ?? readPendingAccessToken();
        if (pending) setAccessToken(pending);
        return;
      }

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
