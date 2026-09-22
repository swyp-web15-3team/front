'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { SearchModal, useSearchModal } from '@/components/common/SearchModal';
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

  return (
    <header
      className={cn(
        'sticky top-0 z-50 flex items-center justify-between border-b border-transparent bg-white px-2 py-4 sm:px-6',
        isScrolled && 'border-gray-300'
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
          className="flex w-full items-center rounded-md bg-gray-100 py-2 pr-8 pl-2 text-left"
        >
          <span
            className={cn(
              'truncate text-sm text-gray-400 transition-opacity',
              isPlaceholderVisible ? 'opacity-100' : 'opacity-0'
            )}
            style={{ transitionDuration: `${SEARCH_PLACEHOLDER_FADE_MS}ms` }}
          >
            {SEARCH_PLACEHOLDER_KEYWORDS[placeholderIndex]}
          </span>
        </button>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 cursor-pointer text-black"
          onClick={(e) => e.preventDefault()}
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>
      <nav className="hidden gap-2 sm:flex sm:gap-4">
        <Link href="/mypage/collection">관심 목록</Link>
        <Link href="/planner">플래너</Link>
        <AuthNavAction />
      </nav>
      <SearchModal />
    </header>
  );
}
