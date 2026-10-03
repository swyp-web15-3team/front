'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { reissueAccessToken } from '@/lib/api/client';
import { rememberCurrentPath } from '@/lib/login-return';
import { useAuthStore } from '@/store/use-auth-store';

/**
 * proxy.ts는 refreshToken 쿠키 유무만 보므로, 만료/무효 쿠키가 남아 있으면 통과된다.
 * 진입 시 로그인 상태가 아니면 재발급을 시도하고, 실패하면 /login으로 보낸다.
 * (진행 중인 재발급은 QueryProvider와 같은 Promise를 공유해 요청은 한 번만 나간다)
 *
 * 진입 시 한 번만 검사한다. 이 화면에서 로그아웃/탈퇴해 로그인이 풀리는 경우는
 * 각 버튼이 메인으로 이동시키므로 여기서 다시 /login으로 보내면 안 된다.
 */
export function LoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (useAuthStore.getState().isAuthenticated) return;

    reissueAccessToken()
      .then((accessToken) =>
        useAuthStore.getState().setAccessToken(accessToken)
      )
      .catch(() => {
        rememberCurrentPath();
        router.replace('/login');
      });
  }, [router]);

  return null;
}
