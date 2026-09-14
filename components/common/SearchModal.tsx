'use client';

import { useState } from 'react';

import { MODAL_ID } from '@/constants/modal';
import { useModal } from '@/hooks/use-modal';
import { Modal } from '@/components/ui/Modal';

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

const RECOMMENDED_KEYWORDS = ['야마자키', '치타', '요이치', '후지', '마르스'];

export function useSearchModal() {
  return useModal(MODAL_ID.SEARCH);
}

export function SearchModal() {
  const { isOpen, close } = useSearchModal();
  const [keyword, setKeyword] = useState('');
  const [recentKeywords, setRecentKeywords] = useState([
    '야마자키',
    '하쿠슈',
    '히비키',
    '닛카',
    '산토리',
  ]);

  const removeRecentKeyword = (target: string) => {
    setRecentKeywords((prev) => prev.filter((item) => item !== target));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      panelClassName="max-w-[1200px] rounded-t-none"
      overlayClassName="items-start"
    >
      <div className="flex items-center gap-3 rounded-md border border-gray-300 px-4 py-2.5">
        <input
          autoFocus
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="search box"
          className="flex-1 border-none text-sm outline-none placeholder:text-gray-400 focus:border-none"
        />
        <SearchIcon className="size-5 text-gray-500" />
        <button aria-label="검색 모달 닫기" onClick={close}>
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
                className="flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1 text-sm"
              >
                {item}
                <button
                  aria-label={`${item} 최근 검색어 삭제`}
                  onClick={() => removeRecentKeyword(item)}
                >
                  <CloseIcon className="size-3 text-gray-400" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5">
        <p className="text-sm text-gray-500">추천 검색어</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {RECOMMENDED_KEYWORDS.map((item) => (
            <button
              key={item}
              onClick={() => setKeyword(item)}
              className="rounded-full border border-gray-300 px-3 py-1 text-sm"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
