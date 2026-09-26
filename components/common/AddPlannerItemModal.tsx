'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

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
import {
  useWhiskyDetailQuery,
  useWhiskyListQuery,
} from '@/hooks/queries/use-whisky';
import { useModal } from '@/hooks/use-modal';
import { cn } from '@/lib/utils';
import { PlannerCandidate } from '@/types/planner';
import { Product } from '@/types/product';
import { WhiskyListItem } from '@/types/whisky';

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

  // 검색 탭은 검색 페이지와 같은 실제 목록 API(GET /whiskies)를 쓴다.
  const {
    data: searchData,
    isLoading: isSearchLoading,
    isError: isSearchError,
    refetch: refetchSearch,
    hasNextPage: hasNextSearchPage,
    isFetchingNextPage: isFetchingNextSearchPage,
    fetchNextPage: fetchNextSearchPage,
  } = useWhiskyListQuery({ query: keyword.trim() || undefined });

  const searchResults = useMemo(
    () => searchData?.pages.flatMap((page) => page.content) ?? [],
    [searchData]
  );
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

  const visibleItems = filterByKeyword(openCollectionItems);

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
            <div className="min-h-0 flex-1">
              <SearchResultList
                items={searchResults}
                isLoading={isSearchLoading}
                isError={isSearchError}
                onRetry={refetchSearch}
                hasNextPage={hasNextSearchPage}
                isFetchingNextPage={isFetchingNextSearchPage}
                onLoadMore={fetchNextSearchPage}
                counts={counts}
                onIncrement={(saleProductId) => changeCount(saleProductId, 1)}
                onDecrement={(saleProductId) => changeCount(saleProductId, -1)}
              />
            </div>
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

function toSearchProduct(whisky: WhiskyListItem): Product {
  return {
    id: whisky.id,
    imageUrl: '',
    name: whisky.name,
    originalName: '',
    discountRate: whisky.comparison
      ? -Math.round(whisky.comparison.diffRatio * 100)
      : 0,
    krPrice: whisky.kr?.amount ?? 0,
    jpPrice: whisky.jp?.amountKrw ?? 0,
    jpPriceYen: whisky.jp?.amount ?? 0,
    volumeMl: whisky.volumeMl,
  };
}

/**
 * 검색 탭 결과. 검색 페이지와 같은 GET /whiskies를 쓰고 로딩/에러/빈 결과와
 * 무한 스크롤 처리도 그대로 맞춘다.
 *
 * 목록 API는 saleProductId를 안 내려주는데 플래너 추가엔 그게 필요하다.
 * 그래서 행을 펼칠 때만 상세(GET /whiskies/{id})를 불러 판매처를 고르게 한다.
 */
function SearchResultList({
  items,
  isLoading,
  isError,
  onRetry,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  counts,
  onIncrement,
  onDecrement,
}: {
  items: WhiskyListItem[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  counts: Map<number, number>;
  onIncrement: (saleProductId: number) => void;
  onDecrement: (saleProductId: number) => void;
}) {
  const sentinelRef = useRef<HTMLLIElement>(null);
  const [expandedWhiskyId, setExpandedWhiskyId] = useState<number | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMore();
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg bg-gray-50 text-xs text-gray-400">
        불러오는 중...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg bg-gray-50 text-xs text-gray-400">
        <p>일시적인 오류가 발생했습니다</p>
        <button type="button" onClick={onRetry} className="underline">
          다시 시도
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg bg-gray-50 text-xs text-gray-400">
        해당하는 상품이 없습니다
      </div>
    );
  }

  return (
    <ul className="h-full overflow-y-auto rounded-lg bg-gray-50 p-2">
      {items.map((whisky) => (
        <li key={whisky.id} className="py-1">
          <div className="flex items-center gap-2 rounded-xl">
            <HorizontalCard
              product={toSearchProduct(whisky)}
              className="flex-1"
            />
            <button
              type="button"
              onClick={() =>
                setExpandedWhiskyId((prev) =>
                  prev === whisky.id ? null : whisky.id
                )
              }
              aria-expanded={expandedWhiskyId === whisky.id}
              className="shrink-0 rounded-md border border-gray-300 px-3 py-1.5 text-xs"
            >
              {expandedWhiskyId === whisky.id ? '닫기' : '판매처'}
            </button>
          </div>

          {expandedWhiskyId === whisky.id && (
            <SaleProductPicker
              whiskyId={whisky.id}
              counts={counts}
              onIncrement={onIncrement}
              onDecrement={onDecrement}
            />
          )}
        </li>
      ))}

      <li ref={sentinelRef} aria-hidden className="h-px" />

      {isFetchingNextPage && (
        <li className="py-2 text-center text-xs text-gray-400">
          불러오는 중...
        </li>
      )}
    </ul>
  );
}

/**
 * 펼친 위스키의 판매처 목록. saleProductId는 상세에만 있어서 여기서 불러온다.
 * 품절이거나 가격이 없는 판매처는 서버가 400으로 거절하므로 담기를 막는다.
 */
function SaleProductPicker({
  whiskyId,
  counts,
  onIncrement,
  onDecrement,
}: {
  whiskyId: number;
  counts: Map<number, number>;
  onIncrement: (saleProductId: number) => void;
  onDecrement: (saleProductId: number) => void;
}) {
  const { data, isLoading, isError, refetch } = useWhiskyDetailQuery(whiskyId);

  if (isLoading) {
    return (
      <p className="py-3 text-center text-xs text-gray-400">불러오는 중...</p>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-1 py-3 text-xs text-gray-400">
        <p>판매처를 불러오지 못했습니다</p>
        <button type="button" onClick={() => refetch()} className="underline">
          다시 시도
        </button>
      </div>
    );
  }

  const saleProducts = data?.saleProducts ?? [];

  if (saleProducts.length === 0) {
    return (
      <p className="py-3 text-center text-xs text-gray-400">
        판매 중인 곳이 없습니다
      </p>
    );
  }

  return (
    <ul className="mt-1 ml-4 flex flex-col gap-1 border-l border-gray-200 pl-3">
      {saleProducts.map((saleProduct) => {
        const count = counts.get(saleProduct.id) ?? 0;
        const isAddable = !saleProduct.isSoldOut && saleProduct.price !== null;

        return (
          <li
            key={saleProduct.id}
            className="flex items-center gap-2 text-xs text-gray-600"
          >
            <span className="min-w-0 flex-1 truncate">
              {saleProduct.retailerName}
              {saleProduct.isDutyFree && ' · 면세'}
            </span>
            <span className="shrink-0">
              {saleProduct.price
                ? `${saleProduct.price.amountKrw?.toLocaleString('ko-KR') ?? saleProduct.price.amount.toLocaleString('ko-KR')}원`
                : saleProduct.isSoldOut
                  ? '품절'
                  : '가격 정보 없음'}
            </span>
            <span className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                aria-label="개수 줄이기"
                disabled={count === 0}
                onClick={() => onDecrement(saleProduct.id)}
                className="flex size-6 items-center justify-center rounded-full border border-gray-300 disabled:opacity-30"
              >
                −
              </button>
              <span className="w-4 text-center">{count}</span>
              <button
                type="button"
                aria-label="개수 늘리기"
                disabled={!isAddable}
                onClick={() => onIncrement(saleProduct.id)}
                className="flex size-6 items-center justify-center rounded-full border border-gray-300 disabled:opacity-30"
              >
                +
              </button>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
