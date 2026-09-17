'use client';

import { useMemo, useState } from 'react';

import { HorizontalCard } from '@/components/ui/HorizontalCard';
import { Modal } from '@/components/ui/Modal';
import { MODAL_ID } from '@/constants/modal';
import { useAddCollectionItemMutation } from '@/hooks/queries/use-collection';
import { useWhiskyCandidateSearchQuery } from '@/hooks/queries/use-whisky';
import { useModal } from '@/hooks/use-modal';
import { PlannerCandidate } from '@/types/planner';
import { Product } from '@/types/product';

export function useAddCollectionItemModal() {
  return useModal(MODAL_ID.ADD_COLLECTION_ITEM);
}

export function AddCollectionItemModal({
  collectionId,
  collectionName,
}: {
  collectionId: number;
  collectionName: string;
}) {
  const { isOpen, close } = useAddCollectionItemModal();
  const [keyword, setKeyword] = useState('');
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());
  const [errorMessage, setErrorMessage] = useState('');

  const { data: searchResults } = useWhiskyCandidateSearchQuery(keyword);
  const addCollectionItemMutation = useAddCollectionItemMutation();

  const results = useMemo(() => searchResults ?? [], [searchResults]);

  function handleClose() {
    setKeyword('');
    setAddedIds(new Set());
    setErrorMessage('');
    close();
  }

  function handleAdd(item: PlannerCandidate) {
    setErrorMessage('');
    addCollectionItemMutation.mutate(
      { collectionId, whiskyId: item.whiskyId },
      {
        onSuccess: () =>
          setAddedIds((prev) => new Set(prev).add(item.whiskyId)),
        onError: () => setErrorMessage('추가에 실패했어요. 다시 시도해주세요.'),
      }
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} panelClassName="max-w-[520px]">
      <p className="text-sm font-medium">
        &apos;{collectionName}&apos;에 위스키 추가
      </p>

      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="위스키 이름으로 검색"
        className="mt-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none"
      />

      <div className="mt-3 max-h-100 overflow-y-auto">
        {keyword.trim() === '' ? (
          <p className="py-6 text-center text-xs text-gray-400">
            추가할 위스키를 검색해 주세요
          </p>
        ) : results.length === 0 ? (
          <p className="py-6 text-center text-xs text-gray-400">
            해당하는 상품이 없습니다
          </p>
        ) : (
          <ul>
            {results.map((item) => (
              <CandidateRow
                key={item.saleProductId}
                item={item}
                added={addedIds.has(item.whiskyId)}
                onAdd={() => handleAdd(item)}
              />
            ))}
          </ul>
        )}
      </div>

      {errorMessage && (
        <p className="mt-2 text-xs text-red-500">{errorMessage}</p>
      )}

      <div className="mt-4">
        <button
          type="button"
          onClick={handleClose}
          className="w-full rounded-md border-2 bg-amber-50 px-3 py-1.5 text-sm text-black"
        >
          완료
        </button>
      </div>
    </Modal>
  );
}

function toCandidateProduct(item: PlannerCandidate): Product {
  return {
    imageUrl: '',
    name: item.whiskyName,
    originalName: item.whiskyOriginalName,
    discountRate: 0,
    krPrice: item.price?.amountKrw ?? 0,
    jpPrice: item.price?.amountKrw ?? 0,
    jpPriceYen: item.price?.amount ?? 0,
  };
}

function CandidateRow({
  item,
  added,
  onAdd,
}: {
  item: PlannerCandidate;
  added: boolean;
  onAdd: () => void;
}) {
  return (
    <li className="py-1">
      <div className="flex items-center gap-2 rounded-xl">
        <HorizontalCard product={toCandidateProduct(item)} className="flex-1" />
        <button
          type="button"
          disabled={added}
          onClick={onAdd}
          className="w-16 shrink-0 rounded-full border border-gray-300 py-1.5 text-xs disabled:opacity-30"
        >
          {added ? '담김' : '담기'}
        </button>
      </div>
    </li>
  );
}
