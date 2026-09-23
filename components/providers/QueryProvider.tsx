'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { reissueAccessToken } from '@/lib/api/client';
import { readPendingSignUp, useAuthStore } from '@/store/use-auth-store';

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => new QueryClient());
  const pathname = usePathname();
  const didRefresh = useRef(false);

  useEffect(() => {
    if (didRefresh.current) {
      return;
    }

    // 로그인 콜백은 쿠키가 막 심어지는 중이라 여기서 refresh를 때리면 불필요한 401이 난다.
    if (pathname.startsWith('/login')) {
      return;
    }

    // 가입 미완료 상태에서 새로고침한 경우. 토큰은 되살리되 로그인으로 승격하지 않는다.
    const isPendingSignUp = readPendingSignUp();

    didRefresh.current = true;
    reissueAccessToken()
      .then((accessToken) => {
        const { setAccessToken, setPendingAccessToken } =
          useAuthStore.getState();

        if (isPendingSignUp) {
          setPendingAccessToken(accessToken);
          return;
        }

        setAccessToken(accessToken);
      })
      .catch(() => {});
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
