'use client';

import { useLogoutMutation } from '@/hooks/queries/use-auth';

export function LogoutButton() {
  const { mutate: logout, isPending } = useLogoutMutation();

  return (
    <button type="button" onClick={() => logout()} disabled={isPending}>
      로그아웃
    </button>
  );
}
