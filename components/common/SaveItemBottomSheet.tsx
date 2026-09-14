'use client';

import { useState } from 'react';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { BOTTOM_SHEET_ID } from '@/constants/bottom-sheet';
import { useBottomSheet } from '@/hooks/use-bottom-sheet';
import { cn } from '@/lib/utils';

// TODO: 컬렉션 API 연동 후 목데이터 제거
const MOCK_COLLECTIONS = [
  { id: '1', name: '기본 위시리스트' },
  { id: '2', name: '위스키 입문' },
  { id: '3', name: '선물용' },
];

export function useSaveItemBottomSheet() {
  return useBottomSheet(BOTTOM_SHEET_ID.SAVE_ITEM);
}

export function SaveItemBottomSheet() {
  const { isOpen, close } = useSaveItemBottomSheet();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <BottomSheet isOpen={isOpen} onClose={close}>
      <h2 className="text-lg font-bold">컬렉션에 저장</h2>
      <ul className="mt-4 flex flex-col gap-1">
        {MOCK_COLLECTIONS.map((collection) => (
          <li key={collection.id}>
            <button
              type="button"
              onClick={() => setSelectedId(collection.id)}
              className={cn(
                'w-full rounded-md px-3 py-2 text-left text-sm',
                selectedId === collection.id
                  ? 'bg-amber-50 font-medium'
                  : 'hover:bg-gray-50'
              )}
            >
              {collection.name}
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-4 w-full rounded-md bg-gray-200 px-3 py-1.5 text-sm text-gray-500"
      >
        + 새 컬렉션 만들기
      </button>
      <button
        type="button"
        disabled={!selectedId}
        onClick={close}
        className="mt-4 w-full rounded-md border-2 bg-amber-50 px-3 py-1.5 text-sm text-black disabled:opacity-50"
      >
        저장
      </button>
    </BottomSheet>
  );
}
