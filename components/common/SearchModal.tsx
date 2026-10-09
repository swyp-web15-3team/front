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
import { useSearchStore } from '@/store/use-search-store';

// 시안 기준 추천 검색어 노출 개수. API 응답이 더 많아도 앞에서부터 이만큼만 보여준다
// 헤더 검색창 placeholder도 같은 개수를 쓴다
export const MAX_SUGGESTIONS = 5;

// 목록 항목이 차례로 등장할 때 항목 사이 간격
const LIST_STAGGER_MS = 30;

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

interface HighlightedKeywordProps {
  keyword: string;
  query: string;
}

// 추천 검색어에서 입력어와 처음 일치하는 부분을 강조한다
function HighlightedKeyword({ keyword, query }: HighlightedKeywordProps) {
  const trimmedQuery = query.trim();
  const start = trimmedQuery
    ? keyword.toLowerCase().indexOf(trimmedQuery.toLowerCase())
    : -1;

  if (start === -1) return keyword;

  const end = start + trimmedQuery.length;

  return (
    <>
      {keyword.slice(0, start)}
      <mark className="text-primary-strong bg-transparent">
        {keyword.slice(start, end)}
      </mark>
      {keyword.slice(end)}
    </>
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
  const presetKeyword = useSearchStore((state) => state.presetKeyword);
  // 모달은 닫혀도 exit 애니메이션 때문에 DOM에 남는다.
  // 열 때마다 목록을 새로 마운트해 등장 애니메이션을 다시 재생하려고 key로 쓴다
  const [openCount, setOpenCount] = useState(0);

  // 모달이 열릴 때 현재 검색어(없으면 헤더에 보이던 추천 검색어)로 input을 채운다 (렌더 중 state 조정 패턴)
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setKeyword(currentQuery || presetKeyword);
      setOpenCount((prev) => prev + 1);
    }
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
      // 채워 둔 검색어를 전체 선택해 바로 타이핑하면 덮어쓰게 한다
      inputRef.current?.select();
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
      overlayClassName="items-start px-0"
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
            className="text-body-sm text-fg placeholder:text-fg-subtle min-w-0 flex-1 bg-transparent py-3.5 outline-none"
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
              <CloseIcon className="text-fg-muted size-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          aria-label="검색"
          className="bg-surface-inverse flex size-12 shrink-0 items-center justify-center rounded-md"
        >
          <SearchIcon className="text-fg-on-dark size-5" />
        </button>
      </form>

      {/* 항목은 키(검색어)별로 마운트될 때 차례로 페이드업된다. 입력으로 추천 검색어가
          바뀌면 새로 생긴 항목만 등장 애니메이션이 재생된다 */}
      <div key={openCount}>
        {recentKeywords.length > 0 && (
          <section className="mt-6">
            <h2 className="text-body-sm text-fg-muted">최근 검색어</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {recentKeywords.map((item, index) => (
                <li
                  key={item}
                  className="border-border text-body-sm animate-fade-up flex max-w-full items-center gap-1.5 rounded-md border px-2.5 py-1.5"
                  style={{ animationDelay: `${index * LIST_STAGGER_MS}ms` }}
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
            <h2 className="text-body-sm text-fg-muted">추천 검색어</h2>
            <ol className="mt-3 flex flex-col gap-3">
              {suggestions.map((item, index) => (
                <li
                  key={item.keyword}
                  className="animate-fade-up"
                  style={{ animationDelay: `${index * LIST_STAGGER_MS}ms` }}
                >
                  <button
                    type="button"
                    onClick={() => handleSearch(item.keyword)}
                    className="text-body-sm flex w-full items-center gap-3 text-left"
                  >
                    <span className="text-fg-muted w-3 shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-body-sm-strong truncate">
                      <HighlightedKeyword
                        keyword={item.keyword}
                        query={debouncedKeyword}
                      />
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </Modal>
  );
}
