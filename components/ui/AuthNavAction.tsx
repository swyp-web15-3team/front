'use client';

import Link from 'next/link';

import { useLogoutMutation } from '@/hooks/queries/use-auth';
import { useAuthStore } from '@/store/use-auth-store';

export function AuthNavAction() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { mutate: logout, isPending } = useLogoutMutation();

  if (!isAuthenticated) {
    return <Link href="/login">로그인</Link>;
  }

  return (
    <button type="button" onClick={() => logout()} disabled={isPending}>
      로그아웃
    </button>
  );
}
