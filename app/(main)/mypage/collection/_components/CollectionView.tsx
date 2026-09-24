'use client';

import { useState } from 'react';

import {
  AddCollectionItemModal,
  useAddCollectionItemModal,
} from '@/components/common/AddCollectionItemModal';
import {
  CollectionMenuModal,
  useCollectionMenuModal,
} from '@/components/common/CollectionMenuModal';
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
  useCollectionWhiskyQuery,
  useCollectionListQuery,
  useCreateCollectionMutation,
  useDeleteCollectionMutation,
  useRemoveCollectionItemMutation,
  useRenameCollectionMutation,
} from '@/hooks/queries/use-collection';
import { cn } from '@/lib/utils';
import { CollectionWhisky } from '@/types/collection';
import { Product } from '@/types/product';

function toProduct(item: CollectionWhisky): Product {
  return {
    imageUrl: '',
    name: item.name,
    // 이 API는 원문명을 내려주지 않는다.
    originalName: '',
    discountRate: 0,
    krPrice: item.kr?.amount ?? 0,
    jpPrice: item.jp?.amountKrw ?? 0,
    jpPriceYen: item.jp?.amount,
    volumeMl: item.volumeMl,
  };
}

export function CollectionView() {
  const { data, isLoading } = useCollectionListQuery();
  const collections = data?.collections ?? [];
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const activeId = selectedId ?? collections[0]?.id ?? null;
  const activeCollection = collections.find((c) => c.id === activeId) ?? null;
  const { data: itemsData, isLoading: isItemsLoading } =
    useCollectionWhiskyQuery(activeId);
  const items = itemsData?.items ?? [];

  // 편집 모드: 카드에 체크박스를 띄우고 선택한 위스키를 한 번에 뺀다.
  const [isEditing, setIsEditing] = useState(false);
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());

  const { open: openCreateModal } = useCreateCollectionModal();
  const { open: openRenameModal } = useRenameCollectionModal();
  const { open: openAddItemModal } = useAddCollectionItemModal();
  const { open: openMenuModal } = useCollectionMenuModal();
  const createCollectionMutation = useCreateCollectionMutation();
  const renameCollectionMutation = useRenameCollectionMutation();
  const deleteCollectionMutation = useDeleteCollectionMutation();
  const removeItemMutation = useRemoveCollectionItemMutation();

  function selectCollection(id: number) {
    setSelectedId(id);
    setIsEditing(false);
    setCheckedIds(new Set());
  }

  function toggleChecked(whiskyId: number) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(whiskyId)) next.delete(whiskyId);
      else next.add(whiskyId);
      return next;
    });
  }

  function handleRemoveChecked() {
    if (!activeCollection || checkedIds.size === 0) return;
    if (!window.confirm(`선택한 ${checkedIds.size}개를 관심 목록에서 뺄까요?`))
      return;

    checkedIds.forEach((whiskyId) => {
      removeItemMutation.mutate({
        collectionId: activeCollection.id,
        whiskyId,
      });
    });
    setCheckedIds(new Set());
    setIsEditing(false);
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
      <ul className="flex h-11 shrink-0 items-stretch gap-1 overflow-x-auto overflow-y-hidden border-b border-gray-200">
        {collections.map((collection) => {
          const isActive = activeId === collection.id;
          return (
            <li key={collection.id} className="flex items-stretch">
              <button
                type="button"
                onClick={() => selectCollection(collection.id)}
                className={cn(
                  '-mb-px border-b-2 px-2 text-sm whitespace-nowrap',
                  isActive
                    ? 'border-black font-bold'
                    : 'border-transparent text-gray-400'
                )}
              >
                {collection.name}
              </button>
              {isActive && (
                <button
                  type="button"
                  onClick={openMenuModal}
                  aria-label={`${collection.name} 더보기`}
                  className="px-1 text-sm text-gray-500"
                >
                  ⋯
                </button>
              )}
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={openCreateModal}
            aria-label="새 관심 목록 추가"
            className="px-2 text-sm whitespace-nowrap text-gray-400"
          >
            +
          </button>
        </li>
      </ul>

      {activeCollection && !isEditing && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={openAddItemModal}
            className="text-xs text-gray-500"
          >
            + 위스키 추가
          </button>
        </div>
      )}

      {isEditing && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">{checkedIds.size}개 선택</span>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleRemoveChecked}
              disabled={checkedIds.size === 0 || removeItemMutation.isPending}
              className="text-red-500 disabled:opacity-30"
            >
              선택 삭제
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setCheckedIds(new Set());
              }}
              className="text-gray-400"
            >
              완료
            </button>
          </div>
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
          {items.map((item) => (
            <div key={item.id} className="relative">
              {isEditing && (
                <label className="absolute top-2 right-2 z-10 flex size-6 items-center justify-center rounded-full bg-white/90 shadow">
                  <input
                    type="checkbox"
                    checked={checkedIds.has(item.id)}
                    onChange={() => toggleChecked(item.id)}
                    aria-label={`${item.name} 선택`}
                  />
                </label>
              )}
              <VerticalCard product={toProduct(item)} />
            </div>
          ))}
        </div>
      )}

      {activeCollection && (
        <CollectionMenuModal
          key={`menu-${activeCollection.id}`}
          isDefault={activeCollection.isDefault}
          onRename={openRenameModal}
          onEdit={() => setIsEditing(true)}
          onDelete={handleDelete}
        />
      )}
      <CreateCollectionModal
        createCollectionMutation={createCollectionMutation}
        onCreated={selectCollection}
      />
      {activeCollection && (
        <RenameCollectionModal
          key={`rename-${activeCollection.id}`}
          collectionId={activeCollection.id}
          initialName={activeCollection.name}
          renameCollectionMutation={renameCollectionMutation}
        />
      )}
      {activeCollection && (
        <AddCollectionItemModal
          key={`add-item-${activeCollection.id}`}
          collectionId={activeCollection.id}
          collectionName={activeCollection.name}
        />
      )}
    </div>
  );
}
