'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', label: '홈' },
  { href: '/wishlist', label: '관심 목록' },
  { href: '/planner', label: '플래너' },
  { href: '/mypage', label: '마이' },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-50 sm:hidden">
        <nav className="border-surface-sunken bg-canvas flex justify-around border-t-2 py-2">
          {NAV_ITEMS.map(({ href, label }) => {
            // 활성 표시만 담당한다. 이동 자체는 Link가 그대로 처리한다.
            const isActive =
              href === '/' ? pathname === '/' : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center',
                  isActive ? 'text-primary' : 'text-fg'
                )}
              >
                <Image
                  src="https://placehold.co/24x24.png"
                  alt={label}
                  width={24}
                  height={24}
                />
                <p className="text-label">{label}</p>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
