'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { reissueAccessToken } from '@/lib/api/client';
import { useAuthStore } from '@/store/use-auth-store';

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
