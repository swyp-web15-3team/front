'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import {
  MAX_SUGGESTIONS,
  SearchModal,
  useSearchModal,
} from '@/components/common/SearchModal';
import { useWhiskySuggestionsQuery } from '@/hooks/queries/use-whisky';
import { useCurrentSearchQuery } from '@/hooks/use-current-search-query';
import { AuthNavAction } from '@/components/ui/AuthNavAction';
import { cn } from '@/lib/utils';

// 추천 검색어를 아직 못 받았거나 비어 있을 때 보여줄 문구
const SEARCH_PLACEHOLDER_FALLBACK = '위스키를 검색해 보세요';

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

  // 검색어 없이 조회한 추천 검색어를 순서대로 돌려 보여준다.
  // 검색 모달의 빈 입력 상태와 같은 쿼리 키라 캐시를 공유한다.
  const { data: suggestionsData } = useWhiskySuggestionsQuery('', true);
  const placeholderKeywords =
    suggestionsData?.suggestions
      .slice(0, MAX_SUGGESTIONS)
      .map(({ keyword }) => keyword) ?? [];
  const placeholderCount = placeholderKeywords.length;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // 돌려 보여줄 검색어가 2개 이상일 때만 순환한다
    if (placeholderCount < 2) return;

    let fadeTimer: ReturnType<typeof setTimeout>;

    const interval = setInterval(() => {
      setIsPlaceholderVisible(false);

      fadeTimer = setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % placeholderCount);
        setIsPlaceholderVisible(true);
      }, SEARCH_PLACEHOLDER_FADE_MS);
    }, SEARCH_PLACEHOLDER_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimer);
    };
  }, [placeholderCount]);

  const placeholder = (
    <span
      className={cn(
        'text-fg-subtle block truncate transition-opacity',
        isPlaceholderVisible ? 'opacity-100' : 'opacity-0'
      )}
      style={{ transitionDuration: `${SEARCH_PLACEHOLDER_FADE_MS}ms` }}
    >
      {/* 재조회로 목록 길이가 줄어도 범위를 벗어나지 않게 나머지 연산을 한다 */}
      {placeholderKeywords[placeholderIndex % placeholderCount] ??
        SEARCH_PLACEHOLDER_FALLBACK}
    </span>
  );

  return (
    <header
      className={cn(
        'glass sticky top-0 z-[var(--z-sticky)] border-b border-transparent transition-colors duration-[280ms] ease-[var(--ease-out-macos)]',
        isScrolled && 'border-border'
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
        <nav className="text-body-sm hidden shrink-0 items-center gap-4 whitespace-nowrap sm:flex md:gap-6">
          {NAV_ITEMS.map(({ href, label, isActive }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'text-fg hover:text-primary-strong',
                isActive(pathname) && 'font-bold'
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
            className="bg-surface-sunken/80 hover:bg-surface-sunken text-body-sm flex w-full min-w-0 items-center gap-2 rounded-full py-2 pr-3 pl-5 text-left transition-colors duration-[180ms] sm:max-w-72"
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
              className="text-fg-muted size-5 shrink-0"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
          <div className="hidden shrink-0 whitespace-nowrap sm:block">
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

  return <span className="text-fg block truncate">{query}</span>;
}
