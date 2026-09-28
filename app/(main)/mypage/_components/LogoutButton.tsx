'use client';

import { useRouter } from 'next/navigation';

import { useLogoutMutation } from '@/hooks/queries/use-auth';

export function LogoutButton() {
  const router = useRouter();
  const { mutate: logout, isPending } = useLogoutMutation();

  return (
    <button
      type="button"
      // 마이페이지는 로그인 전용이라 로그아웃 후 그대로 두면 빈 화면이 남는다.
      onClick={() =>
        logout(undefined, { onSuccess: () => router.replace('/') })
      }
      disabled={isPending}
      className="text-body text-fg hover:text-primary-strong self-start disabled:opacity-50"
    >
      로그아웃
    </button>
  );
}
