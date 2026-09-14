'use client';

import Image from 'next/image';
import { useState } from 'react';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { BOTTOM_SHEET_ID } from '@/constants/bottom-sheet';
import { useCollectionListQuery } from '@/hooks/queries/use-collection';
import { useBottomSheet } from '@/hooks/use-bottom-sheet';
import { cn } from '@/lib/utils';

export interface SaveItemWhisky {
  name: string;
  originalName: string;
  imageUrl?: string;
}

export function useSaveItemBottomSheet() {
  return useBottomSheet<SaveItemWhisky>(BOTTOM_SHEET_ID.SAVE_ITEM);
}

export function SaveItemBottomSheet() {
  const { isOpen, close, payload: whisky } = useSaveItemBottomSheet();
  const { data } = useCollectionListQuery();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const collections = data?.collections ?? [];

  return (
    <BottomSheet isOpen={isOpen} onClose={close}>
      {whisky && (
        <div className="mb-4 flex items-center gap-3">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100">
            {whisky.imageUrl && (
              <Image
                src={whisky.imageUrl}
                alt={whisky.name}
                fill
                className="object-cover"
              />
            )}
          </div>
          <div>
            <p className="font-bold">{whisky.name}</p>
            <p className="text-sm text-gray-400">{whisky.originalName}</p>
          </div>
        </div>
      )}
      <h2 className="text-lg font-bold">컬렉션에 저장</h2>
      <ul className="mt-4 flex flex-col gap-1">
        {collections.map((collection) => (
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
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={close}
          className="mt-4 w-full rounded-md border-2 bg-amber-50 px-3 py-1.5 text-sm text-black disabled:opacity-50"
        >
          취소
        </button>
        <button
          type="button"
          disabled={!selectedId}
          onClick={close}
          className="mt-4 w-full rounded-md border-2 bg-amber-50 px-3 py-1.5 text-sm text-black disabled:opacity-50"
        >
          완료
        </button>
      </div>
    </BottomSheet>
  );
}
