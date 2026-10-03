'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { rememberCurrentPath } from '@/lib/login-return';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/use-auth-store';

export function AuthNavAction() {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

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
        회원가입/로그인
      </button>
    );
  }

  // 로그아웃은 마이페이지 안에서 한다.
  return (
    <Link
      href="/mypage"
      className={cn(
        'text-body-sm hover:text-primary-strong',
        pathname === '/mypage' && 'font-bold'
      )}
    >
      마이페이지
    </Link>
  );
}
