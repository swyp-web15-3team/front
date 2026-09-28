'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { HorizontalCard } from '@/components/ui/HorizontalCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { MODAL_ID } from '@/constants/modal';
import {
  useCollectionItemsQueries,
  useCollectionListQuery,
} from '@/hooks/queries/use-collection';
import { useAddCollectionItemMutation } from '@/hooks/queries/use-collection';
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
import { cn, whiskyToProduct } from '@/lib/utils';
import { WhiskyListItem } from '@/types/whisky';

type Tab = 'collection' | 'all';

interface AddPlannerItemModalProps {
  /**
   * 넘기면 "컬렉션에 담기" 모드로 동작한다. 컬렉션 탭 없이 검색만 보여주고,
   * 수량/판매처 대신 행마다 담기 버튼을 둬 한 번에 한 개씩 바로 추가한다.
   * 생략하면 기존 플래너 추가 모달 그대로다.
   */
  collection?: { id: number; name: string };
}

export function useAddPlannerItemModal() {
  return useModal(MODAL_ID.ADD_PLANNER_ITEM);
}

export function AddPlannerItemModal({
  collection,
}: AddPlannerItemModalProps = {}) {
  const { isOpen, close } = useAddPlannerItemModal();
  const isCollectionMode = collection !== undefined;
  // 컬렉션 모드엔 컬렉션 탭이 없다.
  const [tab, setTab] = useState<Tab>(collection ? 'all' : 'collection');
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
  // 컬렉션 모드: 담은 위스키 id. 행 버튼을 '담김'으로 바꾸는 데만 쓴다.
  const [addedWhiskyIds, setAddedWhiskyIds] = useState<Set<number>>(new Set());
  const addCollectionItemMutation = useAddCollectionItemMutation();

  // 컬렉션은 판매처가 아니라 위스키 단위라, 고르는 즉시 한 개씩 담는다.
  function handleAddToCollection(whisky: WhiskyListItem) {
    if (!collection) return;
    setErrorMessage('');
    addCollectionItemMutation.mutate(
      { collectionId: collection.id, whiskyId: whisky.id },
      {
        onSuccess: () =>
          setAddedWhiskyIds((prev) => new Set(prev).add(whisky.id)),
        onError: () => setErrorMessage('추가에 실패했어요. 다시 시도해주세요.'),
      }
    );
  }

  const totalSelectedCount = useMemo(
    () => Array.from(counts.values()).reduce((sum, c) => sum + c, 0),
    [counts]
  );

  // 컬렉션 탭에서 검색어가 있으면, 매칭되는 위스키가 속한 첫 컬렉션을 자동으로 연다.
  const keywordMatchedCollectionId = useMemo(() => {
    if (tab !== 'collection' || !keyword.trim()) return null;

    const lowerKeyword = keyword.trim().toLowerCase();
    const matchedIndex = collectionIds.findIndex((_, index) =>
      (collectionItemQueries[index]?.data?.items ?? []).some((item) =>
        item.name.toLowerCase().includes(lowerKeyword)
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
    setAddedWhiskyIds(new Set());
    setIsConfirmingClose(false);
    setErrorMessage('');
    close();
  }

  // 오버레이 클릭/Esc/취소 버튼으로 닫으려 할 때 호출된다.
  // 선택 내역이 있으면 바로 닫지 않고 확인 안내를 먼저 보여준다.
  function requestClose() {
    // 컬렉션 모드는 고를 때마다 이미 저장돼서 잃을 선택이 없다.
    if (!isCollectionMode && totalSelectedCount > 0) {
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

  function filterByKeyword(items: WhiskyListItem[]) {
    if (!keyword.trim()) return items;
    const lowerKeyword = keyword.trim().toLowerCase();
    return items.filter((item) =>
      item.name.toLowerCase().includes(lowerKeyword)
    );
  }

  const visibleItems = filterByKeyword(openCollectionItems);

  const whiskyList = (
    <SearchResultList
      items={visibleItems}
      isLoading={false}
      isError={false}
      onRetry={() => {}}
      hasNextPage={false}
      isFetchingNextPage={false}
      onLoadMore={() => {}}
      counts={counts}
      onIncrement={(saleProductId) => changeCount(saleProductId, 1)}
      onDecrement={(saleProductId) => changeCount(saleProductId, -1)}
    />
  );

  if (isConfirmingClose) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={() => setIsConfirmingClose(false)}
        panelClassName="max-w-[360px]"
      >
        <p className="text-body-sm-strong text-center">
          추가하지 않고 종료하시겠습니까?
        </p>
        <p className="text-caption text-fg-muted mt-1 text-center">
          선택한 상품 {totalSelectedCount}개가 저장되지 않습니다.
        </p>
        <div className="mt-4 flex gap-2">
          <Button fullWidth onClick={() => setIsConfirmingClose(false)}>
            계속 담기
          </Button>
          <Button variant="secondary" fullWidth onClick={handleClose}>
            종료
          </Button>
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
      {isCollectionMode && (
        <p className="text-body-sm-strong mb-3">
          &apos;{collection.name}&apos;에 위스키 추가
        </p>
      )}

      <div className="flex min-h-0 flex-1 gap-3">
        {/* 1열: 컬렉션 / 검색 전환. 컬렉션 모드는 검색만 쓰므로 숨긴다 */}
        {!isCollectionMode && (
          <div className="text-body-sm flex w-24 shrink-0 flex-col gap-1">
            {(['collection', 'all'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={cn(
                  'rounded-md px-3 py-2 text-left',
                  tab === value
                    ? 'bg-surface-sunken font-bold'
                    : 'text-fg-muted hover:bg-surface-muted'
                )}
              >
                {value === 'collection' ? '컬렉션' : '검색'}
              </button>
            ))}
          </div>
        )}

        {tab === 'collection' && !isCollectionMode ? (
          <>
            {/* 2열: 컬렉션 목록 */}
            <ul className="text-body-sm flex w-48 shrink-0 flex-col gap-1 overflow-y-auto">
              {collections.map((collection, index) => (
                <li key={collection.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedCollectionId(collection.id)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-md px-3 py-2 text-left',
                      openCollectionId === collection.id
                        ? 'bg-surface-sunken font-bold'
                        : 'hover:bg-surface-muted'
                    )}
                  >
                    <span className="truncate">{collection.name}</span>
                    <span className="text-caption text-fg-muted ml-2 shrink-0">
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
              className="border-border-strong text-body bg-canvas text-fg w-full rounded-md border px-3 py-2.5 outline-none"
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
                addedWhiskyIds={isCollectionMode ? addedWhiskyIds : undefined}
                onAddWhisky={
                  isCollectionMode ? handleAddToCollection : undefined
                }
              />
            </div>
          </div>
        )}
      </div>

      {!isCollectionMode && (
        <div className="text-caption text-fg-muted mt-3 flex items-center justify-between">
          <span>{totalSelectedCount}개의 상품 선택</span>
          {totalSelectedCount > 0 && (
            <button type="button" onClick={() => setCounts(new Map())}>
              모두 선택 취소
            </button>
          )}
        </div>
      )}

      {errorMessage && (
        <p className="text-caption text-danger mt-2">{errorMessage}</p>
      )}

      {isCollectionMode ? (
        <div className="mt-4">
          <Button fullWidth onClick={handleClose}>
            완료
          </Button>
        </div>
      ) : (
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" fullWidth onClick={requestClose}>
            취소
          </Button>
          <Button
            fullWidth
            disabled={
              totalSelectedCount === 0 || addPlannerItemMutation.isPending
            }
            onClick={handleComplete}
          >
            {addPlannerItemMutation.isPending ? '추가 중...' : '완료'}
          </Button>
        </div>
      )}
    </Modal>
  );
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
  addedWhiskyIds,
  onAddWhisky,
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
  /** 넘어오면 컬렉션 모드: 판매처/수량 대신 행마다 담기 버튼을 그린다. */
  addedWhiskyIds?: Set<number>;
  onAddWhisky?: (whisky: WhiskyListItem) => void;
}) {
  const sentinelRef = useRef<HTMLLIElement>(null);
  const [expandedWhiskyId, setExpandedWhiskyId] = useState<number | null>(null);
  const isCollectionMode = onAddWhisky !== undefined;

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
      <div className="bg-surface-muted text-caption text-fg-muted flex h-full items-center justify-center rounded-lg">
        불러오는 중...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-surface-muted text-caption text-fg-muted flex h-full flex-col items-center justify-center gap-2 rounded-lg">
        <p>일시적인 오류가 발생했습니다</p>
        <button type="button" onClick={onRetry} className="underline">
          다시 시도
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-surface-muted text-caption text-fg-muted flex h-full items-center justify-center rounded-lg">
        해당하는 상품이 없습니다
      </div>
    );
  }

  return (
    <ul className="bg-surface-muted h-full overflow-y-auto rounded-lg p-2">
      {items.map((whisky) => (
        <li key={whisky.id} className="py-1">
          <div className="flex items-center gap-2 rounded-xl">
            <HorizontalCard
              product={whiskyToProduct(whisky)}
              className="flex-1"
            />
            {isCollectionMode ? (
              <button
                type="button"
                disabled={addedWhiskyIds?.has(whisky.id)}
                onClick={() => onAddWhisky?.(whisky)}
                className="border-border-strong text-caption w-16 shrink-0 rounded-full border py-1.5 disabled:opacity-30"
              >
                {addedWhiskyIds?.has(whisky.id) ? '담김' : '담기'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  setExpandedWhiskyId((prev) =>
                    prev === whisky.id ? null : whisky.id
                  )
                }
                aria-expanded={expandedWhiskyId === whisky.id}
                className="border-border-strong text-caption shrink-0 rounded-md border px-3 py-1.5"
              >
                {expandedWhiskyId === whisky.id ? '닫기' : '판매처'}
              </button>
            )}
          </div>

          {!isCollectionMode && expandedWhiskyId === whisky.id && (
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
        <li className="text-caption text-fg-muted py-2 text-center">
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
      <p className="text-caption text-fg-muted py-3 text-center">
        불러오는 중...
      </p>
    );
  }

  if (isError) {
    return (
      <div className="text-caption text-fg-muted flex flex-col items-center gap-1 py-3">
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
      <p className="text-caption text-fg-muted py-3 text-center">
        판매 중인 곳이 없습니다
      </p>
    );
  }

  return (
    <ul className="border-border mt-1 ml-4 flex flex-col gap-1 border-l pl-3">
      {saleProducts.map((saleProduct) => {
        const count = counts.get(saleProduct.id) ?? 0;
        const isAddable = !saleProduct.isSoldOut && saleProduct.price !== null;

        return (
          <li
            key={saleProduct.id}
            className="text-caption text-fg flex items-center gap-2"
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
                className="border-border-strong flex size-6 items-center justify-center rounded-full border disabled:opacity-30"
              >
                −
              </button>
              <span className="w-4 text-center">{count}</span>
              <button
                type="button"
                aria-label="개수 늘리기"
                disabled={!isAddable}
                onClick={() => onIncrement(saleProduct.id)}
                className="border-border-strong flex size-6 items-center justify-center rounded-full border disabled:opacity-30"
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
