'use client';

import { useRouter } from 'next/navigation';

import { useLogoutMutation } from '@/hooks/queries/use-auth';
import { rememberCurrentPath } from '@/lib/login-return';
import { useAuthStore } from '@/store/use-auth-store';

export function AuthNavAction() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { mutate: logout, isPending } = useLogoutMutation();

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        className="text-body-sm hover:text-primary-strong"
        onClick={() => {
          rememberCurrentPath();
          router.push('/login');
        }}
      >
        로그인
      </button>
    );
  }

  return (
    <button
      type="button"
      className="text-body-sm hover:text-primary-strong disabled:opacity-50"
      onClick={() => logout()}
      disabled={isPending}
    >
      로그아웃
    </button>
  );
}
