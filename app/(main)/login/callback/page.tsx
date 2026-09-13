'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

import { useAuthStore } from '@/store/use-auth-store';

function LoginCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');

    if (accessToken) {
      const isNewUser = searchParams.get('isNewUser') === 'true';
      setAccessToken(accessToken);
      router.replace(isNewUser ? '/signup/terms' : '/');
      return;
    }

    router.replace('/login');
  }, [searchParams, setAccessToken, router]);

  return null;
}

export default function LoginCallbackPage() {
  return (
    <Suspense>
      <LoginCallback />
    </Suspense>
  );
}
