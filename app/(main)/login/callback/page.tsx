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

    if (accessToken) {
      // ponytail: 백엔드 미연동 상태라 신규/기존 회원 구분 없이 항상 약관 동의부터 보여준다.
      // 백엔드 연동 후에는 isNewUser 등으로 분기할 것.
      setAccessToken(accessToken);
      router.replace('/signup/terms');
      return;
    }

    if (process.env.NODE_ENV !== 'production') {
      // ponytail: 백엔드 미연동 상태에서 /login/callback을 직접 열어 개발할 때만 쓰는 mock 경로.
      // 프로덕션에서는 accessToken 없이 이 페이지에 온 것이므로 로그인 실패로 처리한다.
      setAccessToken('mock-access-token');
      router.replace('/signup/terms');
      return;
    }

    router.replace('/login');
  }, [searchParams, setAccessToken, router]);

  return null;
}
