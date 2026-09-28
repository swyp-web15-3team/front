'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { SearchModal, useSearchModal } from '@/components/common/SearchModal';
import { useCurrentSearchQuery } from '@/hooks/use-current-search-query';
import { AuthNavAction } from '@/components/ui/AuthNavAction';
import { cn } from '@/lib/utils';

// 검색창에 표시할 추천 검색어
// 무신사 UI를 많이 참고하시는 것 같아 같이 구현해봄
const SEARCH_PLACEHOLDER_KEYWORDS = [
  '야마자키 12년',
  '하이볼 레시피',
  '위스키 입문 추천',
  '가을 신상 위크 오프라인 단독 할인',
];

const SEARCH_PLACEHOLDER_INTERVAL_MS = 3000;
const SEARCH_PLACEHOLDER_FADE_MS = 200;

interface NavItem {
  href: string;
  label: string;
  isActive: (pathname: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/',
    label: '탐색',
    isActive: (pathname) =>
      pathname === '/' ||
      pathname.startsWith('/search') ||
      pathname.startsWith('/detail'),
  },
  {
    href: '/mypage/collection',
    label: '콜렉션',
    isActive: (pathname) => pathname.startsWith('/mypage/collection'),
  },
  {
    href: '/planner',
    label: '플래너',
    isActive: (pathname) => pathname.startsWith('/planner'),
  },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { open: openSearchModal } = useSearchModal();
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isPlaceholderVisible, setIsPlaceholderVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let fadeTimer: ReturnType<typeof setTimeout>;

    const interval = setInterval(() => {
      setIsPlaceholderVisible(false);

      fadeTimer = setTimeout(() => {
        setPlaceholderIndex(
          (prev) => (prev + 1) % SEARCH_PLACEHOLDER_KEYWORDS.length
        );
        setIsPlaceholderVisible(true);
      }, SEARCH_PLACEHOLDER_FADE_MS);
    }, SEARCH_PLACEHOLDER_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimer);
    };
  }, []);

  const placeholder = (
    <span
      className={cn(
        'block truncate text-sm text-gray-400 transition-opacity',
        isPlaceholderVisible ? 'opacity-100' : 'opacity-0'
      )}
      style={{ transitionDuration: `${SEARCH_PLACEHOLDER_FADE_MS}ms` }}
    >
      {SEARCH_PLACEHOLDER_KEYWORDS[placeholderIndex]}
    </span>
  );

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-transparent bg-white',
        isScrolled && 'border-gray-300'
      )}
    >
      <div className="mx-auto flex max-w-300 items-center gap-4 px-4 py-3 sm:px-6 md:gap-6">
        <Link href="/" className="shrink-0">
          <Image
            src="https://placehold.co/120x31.png"
            alt="Logo"
            width={120}
            height={31}
          />
        </Link>
        <nav className="hidden shrink-0 items-center gap-4 text-sm whitespace-nowrap sm:flex md:gap-6">
          {NAV_ITEMS.map(({ href, label, isActive }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'text-gray-900',
                isActive(pathname) && 'font-bold text-black'
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-4 md:gap-6">
          <button
            type="button"
            onClick={openSearchModal}
            id="search-bar"
            aria-label="검색"
            className="flex w-full min-w-0 items-center gap-2 rounded-full bg-gray-100 py-2 pr-3 pl-5 text-left sm:max-w-72"
          >
            <span className="min-w-0 flex-1">
              {/* useSearchParams는 Suspense 경계가 필요하다 (layout에서 렌더되므로) */}
              <Suspense fallback={placeholder}>
                <SearchBarText placeholder={placeholder} />
              </Suspense>
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="size-5 shrink-0 text-gray-500"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
          <div className="hidden shrink-0 text-sm whitespace-nowrap sm:block">
            <AuthNavAction />
          </div>
        </div>
      </div>
      <Suspense fallback={null}>
        <SearchModal />
      </Suspense>
    </header>
  );
}

interface SearchBarTextProps {
  placeholder: React.ReactNode;
}

// 검색 결과 페이지에서는 현재 검색어를, 그 외에는 추천 검색어 placeholder를 보여준다
function SearchBarText({ placeholder }: SearchBarTextProps) {
  const query = useCurrentSearchQuery();

  if (!query) return placeholder;

  return <span className="block truncate text-sm text-black">{query}</span>;
}
