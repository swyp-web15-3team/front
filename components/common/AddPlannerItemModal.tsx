'use client';

import { useMemo, useState } from 'react';

import { HorizontalCard } from '@/components/ui/HorizontalCard';
import { Modal } from '@/components/ui/Modal';
import { MODAL_ID } from '@/constants/modal';
import {
  useCollectionItemsQueries,
  useCollectionListQuery,
} from '@/hooks/queries/use-collection';
import { useAddPlannerItemMutation } from '@/hooks/queries/use-planner';
import { useWhiskyCandidateSearchQuery } from '@/hooks/queries/use-whisky';
import { useModal } from '@/hooks/use-modal';
import { cn } from '@/lib/utils';
import { PlannerCandidate } from '@/types/planner';
import { Product } from '@/types/product';

type Tab = 'collection' | 'all';

export function useAddPlannerItemModal() {
  return useModal(MODAL_ID.ADD_PLANNER_ITEM);
}

export function AddPlannerItemModal() {
  const { isOpen, close } = useAddPlannerItemModal();
  const [tab, setTab] = useState<Tab>('collection');
  const [keyword, setKeyword] = useState('');
  const [openCollectionIds, setOpenCollectionIds] = useState<Set<number>>(
    new Set()
  );
  // saleProductId -> 선택 개수. 동일한 술을 다시 클릭하면 개수만 늘어난다.
  const [counts, setCounts] = useState<Map<number, number>>(new Map());
  const [isConfirmingClose, setIsConfirmingClose] = useState(false);

  const { data: collectionData } = useCollectionListQuery();
  const collections = useMemo(
    () => collectionData?.collections ?? [],
    [collectionData]
  );
  const collectionIds = useMemo(
    () => collections.map((c) => c.id),
    [collections]
  );
  const collectionItemQueries = useCollectionItemsQueries(collectionIds);

  const { data: searchResults } = useWhiskyCandidateSearchQuery(keyword);
  const addPlannerItemMutation = useAddPlannerItemMutation();

  const totalSelectedCount = useMemo(
    () => Array.from(counts.values()).reduce((sum, c) => sum + c, 0),
    [counts]
  );

  // 컬렉션 탭에서 검색어가 있으면, 매칭되는 위스키가 속한 컬렉션의 드롭다운을 자동으로 연다.
  const matchedCollectionIds = useMemo(() => {
    if (tab !== 'collection' || !keyword.trim()) return null;

    const lowerKeyword = keyword.trim().toLowerCase();
    const matched = new Set<number>();
    collectionIds.forEach((id, index) => {
      const items = collectionItemQueries[index]?.data?.items ?? [];
      const hasMatch = items.some(
        (item) =>
          item.whiskyName.toLowerCase().includes(lowerKeyword) ||
          item.whiskyOriginalName.toLowerCase().includes(lowerKeyword)
      );
      if (hasMatch) matched.add(id);
    });
    return matched;
  }, [tab, keyword, collectionIds, collectionItemQueries]);

  function toggleCollection(collectionId: number) {
    setOpenCollectionIds((prev) => {
      const next = new Set(prev);
      if (next.has(collectionId)) {
        next.delete(collectionId);
      } else {
        next.add(collectionId);
      }
      return next;
    });
  }

  function changeCount(saleProductId: number, diff: 1 | -1) {
    setCounts((prev) => {
      const next = new Map(prev);
      const count = Math.max((next.get(saleProductId) ?? 0) + diff, 0);
      if (count === 0) {
        next.delete(saleProductId);
      } else {
        next.set(saleProductId, count);
      }
      return next;
    });
  }

  function handleClose() {
    setKeyword('');
    setCounts(new Map());
    setIsConfirmingClose(false);
    close();
  }

  // 오버레이 클릭/Esc/취소 버튼으로 닫으려 할 때 호출된다.
  // 선택 내역이 있으면 바로 닫지 않고 확인 안내를 먼저 보여준다.
  function requestClose() {
    if (totalSelectedCount > 0) {
      setIsConfirmingClose(true);
      return;
    }
    handleClose();
  }

  function handleComplete() {
    const saleProductIds = Array.from(counts.entries()).flatMap(
      ([saleProductId, count]) => Array(count).fill(saleProductId)
    );
    // 리스트 갱신(invalidate)이 끝난 뒤에 모달을 닫아야
    // 모달이 사라지는 시점에 플래너 리스트도 함께 갱신되어 보인다.
    addPlannerItemMutation.mutate(saleProductIds, {
      onSuccess: handleClose,
    });
  }

  function filterByKeyword(items: PlannerCandidate[]) {
    if (!keyword.trim()) return items;
    const lowerKeyword = keyword.trim().toLowerCase();
    return items.filter(
      (item) =>
        item.whiskyName.toLowerCase().includes(lowerKeyword) ||
        item.whiskyOriginalName.toLowerCase().includes(lowerKeyword)
    );
  }

  if (isConfirmingClose) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={() => setIsConfirmingClose(false)}
        panelClassName="max-w-[360px]"
      >
        <p className="text-center text-sm font-medium">
          추가하지 않고 종료하시겠습니까?
        </p>
        <p className="mt-1 text-center text-xs text-gray-400">
          선택한 상품 {totalSelectedCount}개가 저장되지 않습니다.
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setIsConfirmingClose(false)}
            className="w-full rounded-md border-2 bg-amber-50 px-3 py-1.5 text-sm text-black"
          >
            계속 담기
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="w-full rounded-md border-2 bg-amber-50 px-3 py-1.5 text-sm text-black"
          >
            종료
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={requestClose}
      panelClassName="max-w-[520px]"
    >
      <div className="flex gap-1 rounded-md bg-gray-100 p-1 text-sm">
        <button
          type="button"
          onClick={() => setTab('collection')}
          className={cn(
            'flex-1 rounded-md py-1.5',
            tab === 'collection' ? 'bg-white font-medium' : 'text-gray-500'
          )}
        >
          컬렉션
        </button>
        <button
          type="button"
          onClick={() => setTab('all')}
          className={cn(
            'flex-1 rounded-md py-1.5',
            tab === 'all' ? 'bg-white font-medium' : 'text-gray-500'
          )}
        >
          전체
        </button>
      </div>

      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="search box"
        className="mt-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none"
      />

      <div className="mt-3 max-h-100 overflow-y-auto">
        {tab === 'collection'
          ? collections.map((collection, index) => {
              const items = filterByKeyword(
                collectionItemQueries[index]?.data?.items ?? []
              );
              const isOpenDropdown =
                openCollectionIds.has(collection.id) ||
                (matchedCollectionIds?.has(collection.id) ?? false);

              return (
                <div key={collection.id} className="border-b border-gray-100">
                  <button
                    type="button"
                    onClick={() => toggleCollection(collection.id)}
                    className="flex w-full items-center justify-between py-3 text-sm"
                  >
                    <span>{collection.name}</span>
                    <span
                      className={cn(
                        'transition-transform',
                        isOpenDropdown && 'rotate-90'
                      )}
                    >
                      {'>'}
                    </span>
                  </button>
                  {isOpenDropdown && (
                    <ul className="pb-2">
                      {items.length === 0 ? (
                        <li className="py-2 text-center text-xs text-gray-400">
                          해당하는 상품이 없습니다
                        </li>
                      ) : (
                        items.map((item) => (
                          <CandidateRow
                            key={item.saleProductId}
                            item={item}
                            count={counts.get(item.saleProductId) ?? 0}
                            onIncrement={() =>
                              changeCount(item.saleProductId, 1)
                            }
                            onDecrement={() =>
                              changeCount(item.saleProductId, -1)
                            }
                          />
                        ))
                      )}
                    </ul>
                  )}
                </div>
              );
            })
          : (searchResults ?? []).map((item) => (
              <CandidateRow
                key={item.saleProductId}
                item={item}
                count={counts.get(item.saleProductId) ?? 0}
                onIncrement={() => changeCount(item.saleProductId, 1)}
                onDecrement={() => changeCount(item.saleProductId, -1)}
              />
            ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>{totalSelectedCount}개의 상품 선택</span>
        {totalSelectedCount > 0 && (
          <button type="button" onClick={() => setCounts(new Map())}>
            모두 선택 취소
          </button>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={requestClose}
          className="w-full rounded-md border-2 bg-amber-50 px-3 py-1.5 text-sm text-black"
        >
          취소
        </button>
        <button
          type="button"
          disabled={
            totalSelectedCount === 0 || addPlannerItemMutation.isPending
          }
          onClick={handleComplete}
          className="w-full rounded-md border-2 bg-amber-50 px-3 py-1.5 text-sm text-black disabled:opacity-50"
        >
          {addPlannerItemMutation.isPending ? '추가 중...' : '완료'}
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
  count,
  onIncrement,
  onDecrement,
}: {
  item: PlannerCandidate;
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  return (
    <li className="py-1">
      <div className="flex items-center gap-2 rounded-xl">
        <HorizontalCard product={toCandidateProduct(item)} className="flex-1" />
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label="개수 줄이기"
            disabled={count === 0}
            onClick={onDecrement}
            className="flex size-7 items-center justify-center rounded-full border border-gray-300 text-sm disabled:opacity-30"
          >
            −
          </button>
          <span className="w-4 text-center text-sm">{count}</span>
          <button
            type="button"
            aria-label="개수 늘리기"
            onClick={onIncrement}
            className="flex size-7 items-center justify-center rounded-full border border-gray-300 text-sm"
          >
            +
          </button>
        </div>
      </div>
    </li>
  );
}
