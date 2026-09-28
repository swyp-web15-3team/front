'use client';

import Image from 'next/image';
import Link from 'next/link';
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

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
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
        'text-body-sm text-fg-subtle truncate transition-opacity',
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
        'glass sticky top-0 z-[var(--z-sticky)] flex items-center justify-between border-b border-transparent px-2 py-4 transition-colors duration-[280ms] ease-[var(--ease-out-macos)] sm:px-6',
        isScrolled && 'glass-edge-bottom border-transparent'
      )}
    >
      <Link href="/">
        <Image
          src="https://placehold.co/120x31.png"
          alt="Logo"
          width={120}
          height={31}
        />
      </Link>
      <div className="relative mx-2 max-w-300 flex-1 sm:mx-4">
        <button
          type="button"
          onClick={openSearchModal}
          id="search-bar"
          aria-label="검색"
          className="bg-surface-sunken/80 hover:bg-surface-sunken flex w-full items-center rounded-lg py-2 pr-8 pl-2 text-left transition-colors duration-[180ms]"
        >
          {/* useSearchParams는 Suspense 경계가 필요하다 (layout에서 렌더되므로) */}
          <Suspense fallback={placeholder}>
            <SearchBarText placeholder={placeholder} />
          </Suspense>
        </button>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-fg pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 cursor-pointer"
          onClick={(e) => e.preventDefault()}
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>
      <nav className="text-body-sm hidden gap-2 sm:flex sm:gap-4">
        <Link href="/mypage/collection" className="hover:text-primary-strong">
          관심 목록
        </Link>
        <Link href="/planner" className="hover:text-primary-strong">
          플래너
        </Link>
        <AuthNavAction />
      </nav>
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

  return <span className="text-body-sm text-fg truncate">{query}</span>;
}
