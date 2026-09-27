'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { reissueAccessToken } from '@/lib/api/client';
import { useAuthStore } from '@/store/use-auth-store';

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * 로그인 주체가 바뀌면 화면의 서버 데이터는 전부 남의 것이므로 다시 조회한다.
 * - 토큰이 생겼을 때: mount 직후 재발급, 로그인 콜백, 또는 401을 맞은 요청의
 *   재발급 성공. 인터셉터는 401난 요청 하나만 재시도하므로, 같은 화면의 나머지
 *   쿼리(토큰 없이 나가 비어버린 것들)는 여기서 함께 되살린다.
 * - 토큰이 사라졌을 때: 로그아웃/재발급 실패. 이전 사용자 데이터를 지운다.
 *
 * accessToken 문자열이 아니라 로그인 여부만 본다. 같은 사용자의 토큰만 갱신되는
 * 경우까지 리페치하면 화면이 불필요하게 깜빡인다.
 */
export function subscribeAuthInvalidation(queryClient: QueryClient) {
  return useAuthStore.subscribe((state, prevState) => {
    if (state.isAuthenticated === prevState.isAuthenticated) return;
    queryClient.invalidateQueries();
  });
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => new QueryClient());
  const pathname = usePathname();
  const didRefresh = useRef(false);

  // 재발급 응답이 도착하기 전에 구독이 걸려 있어야 해서 아래 effect보다 먼저 둔다.
  useEffect(() => subscribeAuthInvalidation(queryClient), [queryClient]);

  useEffect(() => {
    if (didRefresh.current) {
      return;
    }

    // 로그인/회원가입 진행 중에는 아직 쿠키가 없거나 막 심어지는 중이라
    // 여기서 refresh를 때리면 불필요한 401이 난다.
    if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
      return;
    }

    didRefresh.current = true;
    reissueAccessToken()
      .then((accessToken) =>
        useAuthStore.getState().setAccessToken(accessToken)
      )
      .catch(() => {});
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
