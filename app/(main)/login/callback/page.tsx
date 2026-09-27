'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

import { peekLoginReturn } from '@/lib/login-return';
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
          next: isNewUser ? '/signup/terms' : (peekLoginReturn()?.path ?? '/'),
        });
      }

      // 신규 유저는 약관 동의(회원가입) 완료 전까지 로그인 처리하지 않는다.
      if (isNewUser) {
        setPendingAccessToken(accessToken);
        router.replace('/signup/terms');
        return;
      }

      setAccessToken(accessToken);
      // 복귀 지점은 여기서 지우지 않는다. 도착한 페이지의 LoginReturnHandler가
      // 저장 모달을 다시 열어야 해서, 소비 시점을 그쪽으로 넘긴다.
      router.replace(peekLoginReturn()?.path ?? '/');
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
