'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

import {
  CreateCollectionModal,
  useCreateCollectionModal,
} from '@/components/common/CreateCollectionModal';
import { Modal } from '@/components/ui/Modal';
import { BOTTOM_SHEET_ID } from '@/constants/bottom-sheet';
import {
  useAddCollectionItemMutation,
  useCollectionItemsQueries,
  useCollectionListQuery,
  useCreateCollectionMutation,
  useRemoveCollectionItemMutation,
} from '@/hooks/queries/use-collection';
import { useBottomSheet } from '@/hooks/use-bottom-sheet';
import { cn } from '@/lib/utils';

const OPTIMISTIC_ERROR_DISMISS_MS = 3000;

export interface SaveItemWhisky {
  id: number;
  name: string;
  originalName: string;
  imageUrl?: string;
}

/** 서버에 담겨 있는 컬렉션(saved)과 체크된 컬렉션(checked)의 차이를 낸다. */
export function diffCollectionIds(
  saved: Set<number>,
  checked: Set<number>
): { toAdd: number[]; toRemove: number[] } {
  return {
    toAdd: [...checked].filter((id) => !saved.has(id)),
    toRemove: [...saved].filter((id) => !checked.has(id)),
  };
}

/**
 * 열림 상태는 모달 스토어가 아니라 바텀시트 스토어(useBottomSheet)를 쓴다.
 * - 모달 스토어는 payload를 받지 않는데, 이 모달은 저장할 위스키를 payload로 넘겨야 한다.
 * - 모달 스토어는 단일 모달 정책이라, 위에 겹쳐 여는 CreateCollectionModal이
 *   이 모달을 닫아버린다.
 */
export function useSaveItemModal() {
  return useBottomSheet<SaveItemWhisky>(BOTTOM_SHEET_ID.SAVE_ITEM);
}

export function SaveItemModal() {
  const { isOpen } = useSaveItemModal();

  // 닫혀 있을 땐 마운트하지 않는다. 상시 마운트된 상태로 컬렉션 조회가 돌면
  // 비로그인 사용자는 401 -> /login 리다이렉트가 무한 반복된다.
  if (!isOpen) return null;

  return <SaveItemModalContent />;
}

function SaveItemModalContent() {
  const { isOpen, close, payload: whisky } = useSaveItemModal();
  const { data } = useCollectionListQuery();
  const collections = useMemo(() => data?.collections ?? [], [data]);
  const collectionIds = useMemo(
    () => collections.map((c) => c.id),
    [collections]
  );
  const collectionItemQueries = useCollectionItemsQueries(collectionIds);

  const { open: openCreateCollectionModal } = useCreateCollectionModal();
  const createCollectionMutation = useCreateCollectionMutation();
  const addCollectionItemMutation = useAddCollectionItemMutation();
  const removeCollectionItemMutation = useRemoveCollectionItemMutation();
  const {
    isPending: isCreatingCollection,
    isError: isCreateCollectionError,
    variables: pendingCollectionName,
    reset: resetCreateCollectionMutation,
  } = createCollectionMutation;

  // 이 위스키가 이미 담겨 있는 컬렉션. 체크박스의 초기 상태가 된다.
  const savedIds = useMemo(() => {
    if (!whisky) return new Set<number>();
    return new Set(
      collectionIds.filter((_, index) =>
        (collectionItemQueries[index]?.data?.items ?? []).some(
          (item) => item.whiskyId === whisky.id
        )
      )
    );
  }, [whisky, collectionIds, collectionItemQueries]);

  // null이면 아직 사용자가 건드리지 않은 상태 = 서버 기준(savedIds)을 그대로 쓴다.
  const [checkedIds, setCheckedIds] = useState<Set<number> | null>(null);
  // 다건 저장 중 실패한 요청 수. 0이면 에러 없음.
  const [failedCount, setFailedCount] = useState(0);
  const effectiveCheckedIds = checkedIds ?? savedIds;

  // 생성 실패 시 낙관적으로 그렸던 칸을 3초 뒤 지운다.
  useEffect(() => {
    if (!isCreateCollectionError) return;

    const timer = setTimeout(() => {
      resetCreateCollectionMutation();
    }, OPTIMISTIC_ERROR_DISMISS_MS);

    return () => clearTimeout(timer);
  }, [isCreateCollectionError, resetCreateCollectionMutation]);

  const showOptimisticItem = isCreatingCollection || isCreateCollectionError;
  const isSaving =
    addCollectionItemMutation.isPending ||
    removeCollectionItemMutation.isPending;

  const { toAdd, toRemove } = diffCollectionIds(savedIds, effectiveCheckedIds);
  // 체크가 서버 상태와 같으면 보낼 게 없다.
  const hasChanges = toAdd.length > 0 || toRemove.length > 0;

  function toggle(collectionId: number) {
    setFailedCount(0);
    setCheckedIds(() => {
      const next = new Set(effectiveCheckedIds);
      if (next.has(collectionId)) {
        next.delete(collectionId);
      } else {
        next.add(collectionId);
      }
      return next;
    });
  }

  function handleClose() {
    setCheckedIds(null);
    setFailedCount(0);
    close();
  }

  // 서버에 다건 저장 API가 없어서 컬렉션 수만큼 요청을 보낸다.
  // 체크된 것 중 새로 생긴 건 추가(POST), 해제된 건 제거(DELETE).
  // 이미 담긴 컬렉션은 toAdd에서 빠지므로 같은 위스키를 POST로 중복 저장하지 않는다.
  // allSettled라 일부가 실패해도 나머지 저장은 그대로 반영되고,
  // 실패가 있으면 모달을 닫지 않아 사용자가 다시 시도할 수 있다.
  async function handleApply() {
    if (!whisky) return;

    const results = await Promise.allSettled([
      ...toAdd.map((collectionId) =>
        addCollectionItemMutation.mutateAsync({
          collectionId,
          whiskyId: whisky.id,
        })
      ),
      ...toRemove.map((collectionId) =>
        removeCollectionItemMutation.mutateAsync({
          collectionId,
          whiskyId: whisky.id,
        })
      ),
    ]);

    const failedCount = results.filter((r) => r.status === 'rejected').length;
    if (failedCount > 0) {
      setFailedCount(failedCount);
      // 성공한 건 서버에 반영됐으니, 체크 상태는 서버 기준으로 되돌려 다시 그린다.
      setCheckedIds(null);
      return;
    }

    handleClose();
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        panelClassName="flex max-h-[80vh] max-w-[480px] flex-col"
      >
        {/* 타이틀: 어떤 술을 저장하는지 보여준다 */}
        <div className="flex items-center gap-3">
          <CollectionThumbnail
            imageUrl={whisky?.imageUrl}
            alt={whisky?.name ?? ''}
            className="size-16"
          />
          <div className="min-w-0">
            <p className="truncate text-lg font-bold">{whisky?.name}</p>
            <p className="truncate text-sm text-gray-500">
              {whisky?.originalName
                ? `${whisky.originalName} · 어디에 보관할까요?`
                : '어디에 보관할까요?'}
            </p>
          </div>
        </div>

        {/* 컬렉션 목록: 체크박스로 다건/단건 저장 */}
        <ul className="mt-6 flex min-h-0 flex-1 flex-col overflow-y-auto">
          {collections.map((collection) => {
            const isChecked = effectiveCheckedIds.has(collection.id);

            return (
              <li key={collection.id}>
                <button
                  type="button"
                  onClick={() => toggle(collection.id)}
                  aria-pressed={isChecked}
                  className="flex w-full items-center gap-3 rounded-lg px-1 py-2 text-left hover:bg-gray-50"
                >
                  {/* 서버가 컬렉션 대표 이미지를 안 내려줘서 빈 타일로 둔다 */}
                  <CollectionThumbnail
                    alt={collection.name}
                    className="size-11"
                  />
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {collection.name}
                  </span>
                  <Checkbox checked={isChecked} />
                </button>
              </li>
            );
          })}
          {showOptimisticItem && (
            <li
              className={cn(
                'flex items-center gap-3 rounded-lg px-1 py-2',
                isCreateCollectionError ? 'text-red-500' : 'text-gray-400'
              )}
            >
              <div className="size-11 shrink-0 rounded-lg bg-gray-100" />
              <span className="min-w-0 flex-1 truncate">
                {pendingCollectionName}
              </span>
              {isCreateCollectionError && (
                <span className="shrink-0 text-xs">생성에 실패했습니다</span>
              )}
            </li>
          )}
        </ul>

        <button
          type="button"
          onClick={openCreateCollectionModal}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-3 text-sm text-gray-600 hover:bg-gray-50"
        >
          관심 목록 추가하기
          <span aria-hidden className="text-lg leading-none">
            +
          </span>
        </button>

        {failedCount > 0 && (
          <p className="mt-2 text-xs text-red-500">
            {failedCount}개 컬렉션 저장에 실패했어요. 다시 시도해주세요.
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm font-medium"
          >
            취소
          </button>
          <button
            type="button"
            disabled={!hasChanges || isSaving}
            onClick={handleApply}
            className="w-full rounded-lg bg-orange-500 px-3 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {isSaving ? '저장 중...' : '적용하기'}
          </button>
        </div>
      </Modal>
      <CreateCollectionModal
        createCollectionMutation={createCollectionMutation}
        onCreated={(collectionId) =>
          setCheckedIds(new Set(effectiveCheckedIds).add(collectionId))
        }
      />
    </>
  );
}

function CollectionThumbnail({
  imageUrl,
  alt,
  className,
}: {
  imageUrl?: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50',
        className
      )}
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={alt}
          fill
          sizes="64px"
          className="object-contain"
        />
      )}
    </div>
  );
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-6 shrink-0 items-center justify-center rounded-md border',
        checked
          ? 'border-orange-500 bg-orange-500 text-white'
          : 'border-gray-300 bg-white'
      )}
    >
      {checked && (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      )}
    </span>
  );
}
