'use client';

import Link from 'next/link';

import { LoginLink } from '@/components/ui/LoginLink';
import { useAuthStore } from '@/store/use-auth-store';

export function AuthNavAction() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <LoginLink>로그인/회원가입</LoginLink>;
  }

  return <Link href="/mypage">마이페이지</Link>;
}
