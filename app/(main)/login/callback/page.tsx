'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { useAuthStore } from '@/store/use-auth-store';

export default function LoginCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');

    // ponytail: 백엔드 미연동 상태라 accessToken 없이 와도 인가된 것으로 간주하고,
    // 신규/기존 회원 구분 없이 항상 약관 동의부터 보여준다.
    // 백엔드 연동 후에는 accessToken 없으면 /login으로 되돌리고, isNewUser 등으로 분기할 것.
    setAccessToken(accessToken ?? 'mock-access-token');
    router.replace('/signup/terms');
  }, [searchParams, setAccessToken, router]);

  return null;
}
