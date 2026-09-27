'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { MODAL_ID } from '@/constants/modal';
import { useModal } from '@/hooks/use-modal';
import { Modal } from '@/components/ui/Modal';
import { useCurrentSearchQuery } from '@/hooks/use-current-search-query';
import { useDebounce } from '@/hooks/use-debounce';
import { useRecentKeywords } from '@/hooks/use-recent-keywords';
import { useWhiskySuggestionsQuery } from '@/hooks/queries/use-whisky';

// 시안 기준 추천 검색어 노출 개수. API 응답이 더 많아도 앞에서부터 이만큼만 보여준다
const MAX_SUGGESTIONS = 5;

interface IconProps {
  className?: string;
}

function SearchIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CloseIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function useSearchModal() {
  return useModal(MODAL_ID.SEARCH);
}

export function SearchModal() {
  const router = useRouter();
  const { isOpen, close } = useSearchModal();
  const currentQuery = useCurrentSearchQuery();
  const [keyword, setKeyword] = useState('');
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  // 모달이 열릴 때 현재 검색어로 input을 채운다 (렌더 중 state 조정 패턴)
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) setKeyword(currentQuery);
  }
  const {
    keywords: recentKeywords,
    add: addRecentKeyword,
    remove: removeRecentKeyword,
  } = useRecentKeywords();

  const debouncedKeyword = useDebounce(keyword, 300);
  const { data } = useWhiskySuggestionsQuery(debouncedKeyword, isOpen);
  const suggestions = data?.suggestions.slice(0, MAX_SUGGESTIONS) ?? [];

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleClose = () => {
    setKeyword('');
    close();
  };

  const handleSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    addRecentKeyword(trimmed);
    handleClose();
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSearch(keyword);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      panelClassName="max-w-[1200px] rounded-t-none"
      overlayClassName="items-start"
    >
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="bg-tertiary flex flex-1 items-center gap-2 rounded-md px-4">
          <label htmlFor="search-keyword" className="sr-only">
            검색어
          </label>
          <input
            ref={inputRef}
            id="search-keyword"
            name="keyword"
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="싱글 몰트 스카치 위스키"
            className="min-w-0 flex-1 bg-transparent py-3.5 text-sm outline-none placeholder:text-gray-400"
          />
          {keyword && (
            <button
              type="button"
              aria-label="검색어 지우기"
              onClick={() => {
                setKeyword('');
                inputRef.current?.focus();
              }}
            >
              <CloseIcon className="size-4 text-gray-400" />
            </button>
          )}
        </div>
        <button
          type="submit"
          aria-label="검색"
          className="flex size-12 shrink-0 items-center justify-center rounded-md bg-black"
        >
          <SearchIcon className="size-5 text-white" />
        </button>
      </form>

      {recentKeywords.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm text-gray-500">최근 검색어</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {recentKeywords.map((item) => (
              <li
                key={item}
                className="flex max-w-full items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-sm"
              >
                <button
                  type="button"
                  onClick={() => handleSearch(item)}
                  className="min-w-0 truncate"
                >
                  {item}
                </button>
                <button
                  type="button"
                  aria-label={`${item} 최근 검색어 삭제`}
                  onClick={() => removeRecentKeyword(item)}
                  className="shrink-0"
                >
                  <CloseIcon className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {suggestions.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm text-gray-500">추천 검색어</h2>
          <ol className="mt-3 flex flex-col gap-3">
            {suggestions.map((item, index) => (
              <li key={item.keyword}>
                <button
                  type="button"
                  onClick={() => handleSearch(item.keyword)}
                  className="flex w-full items-center gap-3 text-left text-sm"
                >
                  <span className="w-3 shrink-0 text-gray-400">
                    {index + 1}
                  </span>
                  <span className="truncate font-medium">{item.keyword}</span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      )}
    </Modal>
  );
}
