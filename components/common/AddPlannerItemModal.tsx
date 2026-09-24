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
import {
  ADD_PLANNER_ITEM_MAX_QUANTITY,
  ADD_PLANNER_ITEM_MAX_TYPES,
  getPlannerErrorMessage,
} from '@/lib/api/planner';
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
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    number | null
  >(null);
  // saleProductId -> 선택 개수. 동일한 술을 다시 클릭하면 개수만 늘어난다.
  const [counts, setCounts] = useState<Map<number, number>>(new Map());
  const [isConfirmingClose, setIsConfirmingClose] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  // 컬렉션 탭에서 검색어가 있으면, 매칭되는 위스키가 속한 첫 컬렉션을 자동으로 연다.
  const keywordMatchedCollectionId = useMemo(() => {
    if (tab !== 'collection' || !keyword.trim()) return null;

    const lowerKeyword = keyword.trim().toLowerCase();
    const matchedIndex = collectionIds.findIndex((_, index) =>
      (collectionItemQueries[index]?.data?.items ?? []).some(
        (item) =>
          item.whiskyName.toLowerCase().includes(lowerKeyword) ||
          item.whiskyOriginalName.toLowerCase().includes(lowerKeyword)
      )
    );
    return matchedIndex === -1 ? null : collectionIds[matchedIndex];
  }, [tab, keyword, collectionIds, collectionItemQueries]);

  const openCollectionId = selectedCollectionId ?? keywordMatchedCollectionId;
  const openCollectionIndex = collectionIds.indexOf(openCollectionId ?? -1);
  const openCollectionItems =
    openCollectionIndex === -1
      ? []
      : (collectionItemQueries[openCollectionIndex]?.data?.items ?? []);

  // 서버 한도(종류 20개, 종류당 20병)를 넘으면 400이라 입력 단계에서 막는다
  function changeCount(saleProductId: number, diff: 1 | -1) {
    setErrorMessage('');
    setCounts((prev) => {
      const current = prev.get(saleProductId) ?? 0;

      if (diff === 1) {
        if (current === 0 && prev.size >= ADD_PLANNER_ITEM_MAX_TYPES) {
          setErrorMessage(
            `한 번에 추가할 수 있는 상품은 ${ADD_PLANNER_ITEM_MAX_TYPES}개까지입니다.`
          );
          return prev;
        }
        if (current >= ADD_PLANNER_ITEM_MAX_QUANTITY) {
          setErrorMessage(
            `한 상품은 ${ADD_PLANNER_ITEM_MAX_QUANTITY}병까지 담을 수 있어요.`
          );
          return prev;
        }
      }

      const next = new Map(prev);
      const count = Math.max(current + diff, 0);
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
    setSelectedCollectionId(null);
    setCounts(new Map());
    setIsConfirmingClose(false);
    setErrorMessage('');
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
    const items = Array.from(counts.entries()).map(
      ([saleProductId, quantity]) => ({ saleProductId, quantity })
    );
    setErrorMessage('');
    // mutate에 넘긴 onSuccess는 훅(use-planner.ts)의 onSuccess가 반환한
    // invalidateQueries Promise가 끝난 뒤에 실행된다. 그래서 이 순서만으로도
    // "리스트 갱신 → 모달 닫힘" 순서가 보장된다.
    addPlannerItemMutation.mutate(items, {
      onSuccess: handleClose,
      // 품절/가격 없음 등은 서버가 어떤 상품인지까지 detail로 알려준다
      onError: (error) =>
        setErrorMessage(
          getPlannerErrorMessage(error, '추가에 실패했어요. 다시 시도해주세요.')
        ),
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

  const visibleItems =
    tab === 'all'
      ? (searchResults ?? [])
      : filterByKeyword(openCollectionItems);

  const whiskyList = (
    <ul className="h-full overflow-y-auto rounded-lg bg-gray-50 p-2">
      {visibleItems.length === 0 ? (
        <li className="py-8 text-center text-xs text-gray-400">
          해당하는 상품이 없습니다
        </li>
      ) : (
        visibleItems.map((item) => (
          <CandidateRow
            key={item.saleProductId}
            item={item}
            count={counts.get(item.saleProductId) ?? 0}
            onIncrement={() => changeCount(item.saleProductId, 1)}
            onDecrement={() => changeCount(item.saleProductId, -1)}
          />
        ))
      )}
    </ul>
  );

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
      panelClassName="flex h-[80vh] max-w-[760px] flex-col"
    >
      <div className="flex min-h-0 flex-1 gap-3">
        {/* 1열: 컬렉션 / 검색 전환 */}
        <div className="flex w-24 shrink-0 flex-col gap-1 text-sm">
          {(['collection', 'all'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={cn(
                'rounded-md px-3 py-2 text-left',
                tab === value
                  ? 'bg-gray-100 font-semibold'
                  : 'text-gray-500 hover:bg-gray-50'
              )}
            >
              {value === 'collection' ? '컬렉션' : '검색'}
            </button>
          ))}
        </div>

        {tab === 'collection' ? (
          <>
            {/* 2열: 컬렉션 목록 */}
            <ul className="flex w-48 shrink-0 flex-col gap-1 overflow-y-auto text-sm">
              {collections.map((collection, index) => (
                <li key={collection.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedCollectionId(collection.id)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-md px-3 py-2 text-left',
                      openCollectionId === collection.id
                        ? 'bg-gray-100 font-semibold'
                        : 'hover:bg-gray-50'
                    )}
                  >
                    <span className="truncate">{collection.name}</span>
                    <span className="ml-2 shrink-0 text-xs text-gray-400">
                      ({collectionItemQueries[index]?.data?.items.length ?? 0})
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            {/* 3열: 위스키 리스트. 컬렉션 선택 시 부드럽게 펼쳐진다 */}
            <div
              className={cn(
                'grid min-w-0 flex-1 transition-all duration-300 ease-out',
                openCollectionId !== null
                  ? 'grid-cols-[1fr] opacity-100'
                  : 'grid-cols-[0fr] opacity-0'
              )}
            >
              <div className="min-w-0 overflow-hidden">{whiskyList}</div>
            </div>
          </>
        ) : (
          /* 검색 탭은 2열: 검색창 아래에 위스키 리스트가 바로 붙는다 */
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="위스키 검색"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none"
            />
            <div className="min-h-0 flex-1">{whiskyList}</div>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>{totalSelectedCount}개의 상품 선택</span>
        {totalSelectedCount > 0 && (
          <button type="button" onClick={() => setCounts(new Map())}>
            모두 선택 취소
          </button>
        )}
      </div>

      {errorMessage && (
        <p className="mt-2 text-xs text-red-500">{errorMessage}</p>
      )}

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
