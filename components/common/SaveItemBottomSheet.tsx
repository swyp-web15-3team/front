'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import {
  CreateCollectionModal,
  useCreateCollectionModal,
} from '@/components/common/CreateCollectionModal';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { BOTTOM_SHEET_ID } from '@/constants/bottom-sheet';
import {
  useCollectionListQuery,
  useCreateCollectionMutation,
} from '@/hooks/queries/use-collection';
import { useBottomSheet } from '@/hooks/use-bottom-sheet';
import { cn } from '@/lib/utils';

const OPTIMISTIC_ERROR_DISMISS_MS = 3000;

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
  const { open: openCreateCollectionModal } = useCreateCollectionModal();
  const createCollectionMutation = useCreateCollectionMutation();
  const {
    isPending: isCreatingCollection,
    isError: isCreateCollectionError,
    variables: pendingCollectionName,
    reset: resetCreateCollectionMutation,
  } = createCollectionMutation;

  // 생성 실패 시 낙관적으로 그렸던 칸을 3초 뒤 지운다.
  useEffect(() => {
    if (!isCreateCollectionError) return;

    const timer = setTimeout(() => {
      resetCreateCollectionMutation();
    }, OPTIMISTIC_ERROR_DISMISS_MS);

    return () => clearTimeout(timer);
  }, [isCreateCollectionError, resetCreateCollectionMutation]);

  const showOptimisticItem = isCreatingCollection || isCreateCollectionError;

  return (
    <>
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
          {showOptimisticItem && (
            <li>
              <div
                className={cn(
                  'w-full cursor-not-allowed rounded-md px-3 py-2 text-left text-sm',
                  isCreateCollectionError
                    ? 'bg-red-50 text-red-500'
                    : 'bg-gray-50 text-gray-400'
                )}
              >
                {pendingCollectionName}
                {isCreateCollectionError && (
                  <span className="ml-2 text-xs">생성에 실패했습니다</span>
                )}
              </div>
            </li>
          )}
        </ul>
        <button
          type="button"
          onClick={openCreateCollectionModal}
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
      <CreateCollectionModal
        createCollectionMutation={createCollectionMutation}
        onCreated={setSelectedId}
      />
    </>
  );
}
