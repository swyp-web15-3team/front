'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { rememberReturnTo } from '@/lib/return-to';

interface LoginLinkProps {
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

/** 로그인 페이지로 보내면서 현재 위치를 복귀 지점으로 기록한다. */
export function LoginLink({
  children,
  className,
  onClick,
  'aria-label': ariaLabel,
}: LoginLinkProps) {
  const pathname = usePathname();

  return (
    <Link
      href="/login"
      className={className}
      aria-label={ariaLabel}
      onClick={(event) => {
        rememberReturnTo(pathname);
        onClick?.(event);
      }}
    >
      {children}
    </Link>
  );
}
