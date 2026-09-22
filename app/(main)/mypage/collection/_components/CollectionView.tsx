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
  useRemoveCollectionItemMutation,
  useRenameCollectionMutation,
} from '@/hooks/queries/use-collection';
import { cn } from '@/lib/utils';
import { PlannerCandidate } from '@/types/planner';
import { Product } from '@/types/product';

function toProduct(item: PlannerCandidate): Product {
  return {
    imageUrl: '',
    name: item.whiskyName,
    originalName: item.whiskyOriginalName,
    discountRate: 0,
    krPrice: item.price?.amountKrw ?? 0,
    jpPrice: item.price?.amountKrw ?? 0,
    jpPriceYen: item.price?.amount,
    volumeMl: item.volumeMl,
  };
}

export function CollectionView() {
  const { data, isLoading } = useCollectionListQuery();
  const collections = data?.collections ?? [];
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const activeId = selectedId ?? collections[0]?.id ?? null;
  const activeCollection = collections.find((c) => c.id === activeId) ?? null;
  const { data: itemsData, isLoading: isItemsLoading } = useCollectionItemQuery(
    activeId ?? 0
  );
  const items = itemsData?.items ?? [];

  const { open: openCreateModal } = useCreateCollectionModal();
  const { open: openRenameModal } = useRenameCollectionModal();
  const { open: openAddItemModal } = useAddCollectionItemModal();
  const createCollectionMutation = useCreateCollectionMutation();
  const renameCollectionMutation = useRenameCollectionMutation();
  const deleteCollectionMutation = useDeleteCollectionMutation();
  const removeItemMutation = useRemoveCollectionItemMutation();

  function handleRemoveItem(whiskyId: number) {
    if (!activeCollection) return;
    if (!window.confirm('이 위스키를 관심 목록에서 뺄까요?')) return;

    removeItemMutation.mutate({
      collectionId: activeCollection.id,
      whiskyId,
    });
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
              onClick={() => setSelectedId(collection.id)}
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
          {items.map((item) => (
            <div key={item.saleProductId} className="relative">
              <button
                type="button"
                onClick={() => handleRemoveItem(item.whiskyId)}
                disabled={removeItemMutation.isPending}
                aria-label="관심 목록에서 빼기"
                className="absolute top-2 right-2 z-10 flex size-6 items-center justify-center rounded-full bg-black/60 text-xs text-white"
              >
                ✕
              </button>
              <VerticalCard product={toProduct(item)} />
            </div>
          ))}
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
