'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

import { useAuthStore } from '@/store/use-auth-store';

function LoginCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setPendingAccessToken = useAuthStore(
    (state) => state.setPendingAccessToken
  );

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');

    if (accessToken) {
      const isNewUser = searchParams.get('isNewUser') === 'true';

      if (process.env.NODE_ENV !== 'production') {
        console.log('[login/callback] 수신', {
          accessToken: `${accessToken.slice(0, 12)}...`,
          isNewUser,
          next: isNewUser ? '/signup/terms' : '/',
        });
      }

      // 신규 유저는 약관 동의(회원가입) 완료 전까지 로그인 처리하지 않는다.
      if (isNewUser) {
        setPendingAccessToken(accessToken);
        router.replace('/signup/terms');
        return;
      }

      setAccessToken(accessToken);
      router.replace('/');
      return;
    }

    router.replace('/login');
  }, [searchParams, setAccessToken, setPendingAccessToken, router]);

  return null;
}

export default function LoginCallbackPage() {
  return (
    <Suspense>
      <LoginCallback />
    </Suspense>
  );
}
