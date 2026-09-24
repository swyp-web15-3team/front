'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { MODAL_ID } from '@/constants/modal';
import { useModal } from '@/hooks/use-modal';
import { Modal } from '@/components/ui/Modal';
import { useDebounce } from '@/hooks/use-debounce';
import { useWhiskySuggestionsQuery } from '@/hooks/queries/use-whisky';

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
  const [keyword, setKeyword] = useState('');
  const [recentKeywords, setRecentKeywords] = useState([
    '야마자키',
    '하쿠슈',
    '히비키',
    '닛카',
    '산토리',
  ]);

  const debouncedKeyword = useDebounce(keyword, 300);
  const { data } = useWhiskySuggestionsQuery(debouncedKeyword, isOpen);

  const removeRecentKeyword = (target: string) => {
    setRecentKeywords((prev) => prev.filter((item) => item !== target));
  };

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

    setRecentKeywords((prev) => [
      trimmed,
      ...prev.filter((item) => item !== trimmed),
    ]);
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
      <div className="flex justify-between gap-3">
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 items-center gap-3 rounded-md border border-gray-300 px-4 py-2.5"
        >
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
            placeholder="search box"
            className="flex-1 border-none text-sm outline-none placeholder:text-gray-400 focus:border-none"
          />
          <button type="submit" aria-label="검색">
            <SearchIcon className="size-5 text-gray-500" />
          </button>
        </form>
        <button type="button" aria-label="검색 모달 닫기" onClick={handleClose}>
          <CloseIcon className="size-5 text-gray-500" />
        </button>
      </div>

      {recentKeywords.length > 0 && (
        <div className="mt-5">
          <p className="text-sm text-gray-500">최근 검색어</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {recentKeywords.map((item) => (
              <span
                key={item}
                onClick={() => handleSearch(item)}
                className="flex cursor-pointer items-center gap-1 rounded-full border border-gray-300 px-3 py-1 text-sm"
              >
                {item}
                <button
                  type="button"
                  aria-label={`${item} 최근 검색어 삭제`}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRecentKeyword(item);
                  }}
                >
                  <CloseIcon className="size-3 text-gray-400" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5">
        <div className="mt-2 flex flex-wrap gap-2">
          {(data?.suggestions.length ?? 0) > 0 && (
            <p className="text-sm text-gray-500">추천 검색어</p>
          )}

          {data?.suggestions.map((item) => (
            <button
              key={item.keyword}
              type="button"
              onClick={() => handleSearch(item.keyword)}
              className="rounded-full border border-gray-300 px-3 py-1 text-sm"
            >
              {item.keyword}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
