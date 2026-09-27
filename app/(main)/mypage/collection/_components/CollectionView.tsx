'use client';

import { useState } from 'react';

import {
  AddCollectionItemModal,
  useAddCollectionItemModal,
} from '@/components/common/AddCollectionItemModal';
import {
  CreateCollectionModal,
  useCreateCollectionModal,
} from '@/components/common/CreateCollectionModal';
import {
  RenameCollectionModal,
  useRenameCollectionModal,
} from '@/components/common/RenameCollectionModal';
import { VerticalCard } from '@/components/ui/VerticalCard';
import {
  useCollectionItemQuery,
  useCollectionListQuery,
  useCreateCollectionMutation,
  useDeleteCollectionMutation,
  useMoveCollectionItemMutation,
  useRemoveCollectionItemMutation,
  useRenameCollectionMutation,
} from '@/hooks/queries/use-collection';
import { cn, whiskyToProduct } from '@/lib/utils';

export function CollectionView() {
  const { data, isLoading } = useCollectionListQuery();
  const collections = data?.collections ?? [];
  const [selectedId, setSelectedId] = useState<number | null>(null);
  // 제거 중인 항목만 버튼을 잠근다(전체가 아니라).
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const activeId = selectedId ?? collections[0]?.id ?? null;
  const activeCollection = collections.find((c) => c.id === activeId) ?? null;
  const { data: itemsData, isLoading: isItemsLoading } =
    useCollectionItemQuery(activeId);
  const items = itemsData?.items ?? [];

  const { open: openCreateModal } = useCreateCollectionModal();
  const { open: openRenameModal } = useRenameCollectionModal();
  const { open: openAddItemModal } = useAddCollectionItemModal();
  const createCollectionMutation = useCreateCollectionMutation();
  const renameCollectionMutation = useRenameCollectionMutation();
  const deleteCollectionMutation = useDeleteCollectionMutation();
  const removeItemMutation = useRemoveCollectionItemMutation();
  const moveItemMutation = useMoveCollectionItemMutation();

  function handleRemoveItem(whiskyId: number) {
    if (!activeCollection) return;
    if (!window.confirm('이 위스키를 관심 목록에서 뺄까요?')) return;

    setRemovingId(whiskyId);
    removeItemMutation.mutate(
      { collectionId: activeCollection.id, whiskyIds: [whiskyId] },
      { onSettled: () => setRemovingId(null) }
    );
  }

  function exitEditing() {
    setIsEditing(false);
    setSelectedIds(new Set());
  }

  function toggleSelected(whiskyId: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (!next.delete(whiskyId)) next.add(whiskyId);
      return next;
    });
  }

  function handleRemoveSelected() {
    if (!activeCollection || selectedIds.size === 0) return;
    if (!window.confirm(`선택한 ${selectedIds.size}개를 관심 목록에서 뺄까요?`))
      return;

    removeItemMutation.mutate(
      { collectionId: activeCollection.id, whiskyIds: [...selectedIds] },
      { onSuccess: exitEditing }
    );
  }

  function handleMoveSelected(targetCollectionId: number) {
    if (!activeCollection || selectedIds.size === 0) return;

    moveItemMutation.mutate(
      {
        collectionId: activeCollection.id,
        targetCollectionId,
        whiskyIds: [...selectedIds],
      },
      { onSuccess: exitEditing }
    );
  }

  function handleDelete() {
    if (!activeCollection) return;
    const message =
      items.length > 0
        ? `'${activeCollection.name}'을(를) 삭제하면 담긴 위스키 ${items.length}개도 함께 삭제됩니다. 삭제할까요?`
        : `'${activeCollection.name}'을(를) 삭제할까요?`;
    if (!window.confirm(message)) return;

    deleteCollectionMutation.mutate(activeCollection.id, {
      onSuccess: () => setSelectedId(null),
    });
  }

  if (isLoading)
    return <p className="mt-4 text-sm text-gray-400">불러오는 중...</p>;

  return (
    <div className="mt-4 flex flex-col gap-4">
      <ul className="flex gap-2 overflow-x-auto">
        {collections.map((collection) => (
          <li key={collection.id}>
            <button
              type="button"
              onClick={() => {
                setSelectedId(collection.id);
                exitEditing();
              }}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm whitespace-nowrap',
                activeId === collection.id
                  ? 'bg-amber-50 font-medium'
                  : 'bg-gray-100 text-gray-500'
              )}
            >
              {collection.name}
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={openCreateModal}
            className="rounded-full bg-gray-100 px-3 py-1.5 text-sm whitespace-nowrap text-gray-500"
          >
            + 새 관심 목록
          </button>
        </li>
      </ul>

      {activeCollection && (
        <div className="flex gap-3 text-xs text-gray-400">
          <button type="button" onClick={openAddItemModal}>
            위스키 추가
          </button>
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => (isEditing ? exitEditing() : setIsEditing(true))}
            >
              {isEditing ? '편집 취소' : '편집하기'}
            </button>
          )}
          {!activeCollection.isDefault && (
            <>
              <button type="button" onClick={openRenameModal}>
                이름 변경
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteCollectionMutation.isPending}
              >
                삭제
              </button>
            </>
          )}
        </div>
      )}

      {activeId === null ? (
        <p className="text-sm text-gray-400">저장한 관심 목록이 없습니다.</p>
      ) : isItemsLoading ? (
        <p className="text-sm text-gray-400">불러오는 중...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-400">담긴 위스키가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {/* 관심 목록에 있는 것들이라 저장 버튼은 전부 '저장됨'이고,
              다시 누르면 목록에서 뺀다. 편집 중에는 카드 전체가 선택 토글이다. */}
          {items.map((item) =>
            isEditing ? (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleSelected(item.id)}
                aria-pressed={selectedIds.has(item.id)}
                className={cn(
                  'relative rounded-xl text-left',
                  selectedIds.has(item.id) && 'ring-2 ring-black'
                )}
              >
                {/* 카드의 저장 버튼은 편집 중엔 안 눌리게 덮는다 */}
                <span className="pointer-events-none block">
                  <VerticalCard product={whiskyToProduct(item)} isSaved />
                </span>
                <span
                  className={cn(
                    'absolute top-2 left-2 flex size-5 items-center justify-center rounded border text-xs',
                    selectedIds.has(item.id)
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 bg-white'
                  )}
                  aria-hidden="true"
                >
                  {selectedIds.has(item.id) ? '✓' : ''}
                </span>
              </button>
            ) : (
              <VerticalCard
                key={item.id}
                product={whiskyToProduct(item)}
                href={`/detail/${item.id}`}
                isSaved
                onUnsave={() => handleRemoveItem(item.id)}
                isUnsaving={removingId === item.id}
              />
            )
          )}
        </div>
      )}

      {isEditing && (
        <div className="sticky bottom-0 flex items-center gap-2 border-t bg-white py-3 text-sm">
          <span className="text-xs text-gray-500">
            {selectedIds.size}개 선택
          </span>
          <select
            value=""
            disabled={selectedIds.size === 0 || moveItemMutation.isPending}
            onChange={(e) => handleMoveSelected(Number(e.target.value))}
            aria-label="다른 관심 목록으로 이동"
            className="ml-auto rounded-md border border-gray-300 px-2 py-1.5 text-xs disabled:opacity-50"
          >
            <option value="" disabled>
              다른 목록으로 이동
            </option>
            {collections
              .filter((c) => c.id !== activeId)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
          <button
            type="button"
            onClick={handleRemoveSelected}
            disabled={selectedIds.size === 0 || removeItemMutation.isPending}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs disabled:opacity-50"
          >
            삭제
          </button>
        </div>
      )}

      <CreateCollectionModal
        createCollectionMutation={createCollectionMutation}
        onCreated={setSelectedId}
      />
      {activeCollection && (
        <RenameCollectionModal
          key={activeCollection.id}
          collectionId={activeCollection.id}
          initialName={activeCollection.name}
          renameCollectionMutation={renameCollectionMutation}
        />
      )}
      {activeCollection && (
        <AddCollectionItemModal
          key={activeCollection.id}
          collectionId={activeCollection.id}
          collectionName={activeCollection.name}
        />
      )}
    </div>
  );
}
