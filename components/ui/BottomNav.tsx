'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', label: '홈', icon: '/icons/home.svg' },
  { href: '/wishlist', label: '콜렉션', icon: '/icons/whisky.svg' },
  { href: '/planner', label: '플래너', icon: '/icons/calculator.svg' },
  { href: '/mypage', label: '마이', icon: '/icons/user.svg' },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-[var(--z-nav)] sm:hidden">
        <nav className="glass glass-edge-top flex justify-around py-2">
          {NAV_ITEMS.map(({ href, label, icon }) => {
            // 활성 표시만 담당한다. 이동 자체는 Link가 그대로 처리한다.
            const isActive =
              href === '/' ? pathname === '/' : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center transition-transform duration-[180ms] ease-[var(--ease-spring-soft)] active:scale-90',
                  isActive ? 'text-primary scale-105' : 'text-fg'
                )}
              >
                {/* SVG를 마스크로 써서 아이콘 색이 텍스트 색(currentColor)을 따라가게 한다. */}
                <span
                  aria-hidden
                  className="size-6 bg-current"
                  style={{
                    maskImage: `url(${icon})`,
                    maskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    maskPosition: 'center',
                  }}
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
