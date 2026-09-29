'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { HorizontalCard } from '@/components/ui/HorizontalCard';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Modal } from '@/components/ui/Modal';
import { MODAL_ID } from '@/constants/modal';
import {
  useCollectionItemsQueries,
  useCollectionListQuery,
} from '@/hooks/queries/use-collection';
import { useAddCollectionItemMutation } from '@/hooks/queries/use-collection';
import { useAddPlannerItemMutation } from '@/hooks/queries/use-planner';
import {
  ADD_PLANNER_ITEM_MAX_TYPES,
  getPlannerErrorMessage,
} from '@/lib/api/planner';
import { fetchWhiskyDetail } from '@/lib/api/whisky';
import { pickCheapestSaleProduct } from '@/lib/api/planner';
import { useWhiskyListQuery, whiskyKeys } from '@/hooks/queries/use-whisky';
import { useModal } from '@/hooks/use-modal';
import { cn, whiskyToProduct } from '@/lib/utils';
import { WhiskyListItem, WhiskySort } from '@/types/whisky';
import { useQueryClient } from '@tanstack/react-query';

// TODO: 추천순은 백엔드에 sort 값이 없다. 추가되면 첫 옵션으로 넣는다.
const SORT_OPTIONS: { label: string; value: WhiskySort }[] = [
  { label: '이름순', value: 'name,asc' },
  { label: '최신순', value: 'id,desc' },
];

/** 왼쪽 목록에서 "전체 검색"을 가리키는 값. 콜렉션 id와 섞이지 않게 null을 쓴다. */
type SourceId = number | null;

interface AddPlannerItemModalProps {
  /**
   * 넘기면 "콜렉션에 담기" 모드로 동작한다. 콜렉션 목록 없이 검색만 보여주고,
   * 행마다 담기 버튼을 둬 한 번에 한 개씩 바로 추가한다.
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
  const queryClient = useQueryClient();
  const isCollectionMode = collection !== undefined;

  // 왼쪽 목록에서 고른 출처. null이면 전체 검색.
  const [sourceId, setSourceId] = useState<SourceId>(null);
  // 입력 중인 검색어와 실제로 요청에 쓰는 검색어를 나눈다(돋보기/엔터로만 검색).
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [sort, setSort] = useState<WhiskySort>('name,asc');
  const [isSortOpen, setIsSortOpen] = useState(false);
  // 체크한 위스키 id. 판매처는 추가 시점에 최저가로 자동 선택한다.
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isConfirmingClose, setIsConfirmingClose] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isResolving, setIsResolving] = useState(false);

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

  // 전체 검색은 검색 페이지와 같은 실제 목록 API(GET /whiskies)를 쓴다.
  const {
    data: searchData,
    isLoading: isSearchLoading,
    isError: isSearchError,
    refetch: refetchSearch,
    hasNextPage: hasNextSearchPage,
    isFetchingNextPage: isFetchingNextSearchPage,
    fetchNextPage: fetchNextSearchPage,
  } = useWhiskyListQuery({ query: keyword.trim() || undefined, sort });

  const searchResults = useMemo(
    () => searchData?.pages.flatMap((page) => page.content) ?? [],
    [searchData]
  );
  const totalCount = searchData?.pages[0]?.totalElements ?? 0;

  const addPlannerItemMutation = useAddPlannerItemMutation();
  // 콜렉션 모드: 담은 위스키 id. 행 버튼을 '담김'으로 바꾸는 데만 쓴다.
  const [addedWhiskyIds, setAddedWhiskyIds] = useState<Set<number>>(new Set());
  const addCollectionItemMutation = useAddCollectionItemMutation();

  // 콜렉션은 판매처가 아니라 위스키 단위라, 고르는 즉시 한 개씩 담는다.
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

  // 콜렉션을 골랐으면 그 목록에서, 아니면 검색 결과에서 고른다.
  // 콜렉션엔 검색창이 없고 전환할 때 검색어도 비우므로 목록을 그대로 쓴다.
  const openCollectionIndex = collectionIds.indexOf(sourceId ?? -1);
  const collectionItems =
    collectionItemQueries[openCollectionIndex]?.data?.items;

  const visibleItems =
    sourceId === null ? searchResults : (collectionItems ?? []);

  function toggleSelected(whiskyId: number) {
    setErrorMessage('');
    setSelectedIds((prev) => {
      if (prev.has(whiskyId)) {
        const next = new Set(prev);
        next.delete(whiskyId);
        return next;
      }
      // 서버가 한 요청당 20종류까지만 받는다
      if (prev.size >= ADD_PLANNER_ITEM_MAX_TYPES) {
        setErrorMessage(
          `한 번에 추가할 수 있는 상품은 ${ADD_PLANNER_ITEM_MAX_TYPES}개까지입니다.`
        );
        return prev;
      }
      return new Set(prev).add(whiskyId);
    });
  }

  function handleClose() {
    setSourceId(null);
    setKeywordInput('');
    setKeyword('');
    setSelectedIds(new Set());
    setAddedWhiskyIds(new Set());
    setIsConfirmingClose(false);
    setErrorMessage('');
    setIsSortOpen(false);
    close();
  }

  // 오버레이 클릭/Esc/취소 버튼으로 닫으려 할 때 호출된다.
  // 선택 내역이 있으면 바로 닫지 않고 확인 안내를 먼저 보여준다.
  function requestClose() {
    // 콜렉션 모드는 고를 때마다 이미 저장돼서 잃을 선택이 없다.
    if (!isCollectionMode && selectedIds.size > 0) {
      setIsConfirmingClose(true);
      return;
    }
    handleClose();
  }

  /**
   * 체크한 위스키를 플래너에 넣는다. 목록 API엔 saleProductId가 없어서
   * 상세를 병렬로 불러 최저가 판매처를 고른 뒤 한 요청으로 보낸다.
   * 판매처는 추가된 뒤 플래너 행의 드롭다운에서 바꾼다.
   */
  async function handleComplete() {
    setErrorMessage('');
    setIsResolving(true);

    try {
      const details = await Promise.all(
        Array.from(selectedIds).map((whiskyId) =>
          queryClient.fetchQuery({
            queryKey: whiskyKeys.detail(whiskyId),
            queryFn: () => fetchWhiskyDetail(whiskyId),
          })
        )
      );

      const items = details.flatMap((detail) => {
        const saleProduct = pickCheapestSaleProduct(detail.saleProducts);
        return saleProduct ? [{ saleProductId: saleProduct.id }] : [];
      });

      if (items.length === 0) {
        setErrorMessage('구매 가능한 판매처가 없어요.');
        return;
      }
      // 전부 품절이면 서버에 보내기 전에 알린다
      if (items.length < details.length) {
        setErrorMessage(
          `${details.length - items.length}개는 구매 가능한 판매처가 없어 제외했어요.`
        );
      }

      // mutate에 넘긴 onSuccess는 훅(use-planner.ts)의 onSuccess가 반환한
      // invalidateQueries Promise가 끝난 뒤에 실행된다. 그래서 이 순서만으로도
      // "리스트 갱신 → 모달 닫힘" 순서가 보장된다.
      addPlannerItemMutation.mutate(items, {
        onSuccess: handleClose,
        // 품절/가격 없음 등은 서버가 어떤 상품인지까지 detail로 알려준다
        onError: (error) =>
          setErrorMessage(
            getPlannerErrorMessage(
              error,
              '추가에 실패했어요. 다시 시도해주세요.'
            )
          ),
      });
    } catch {
      setErrorMessage('판매처를 불러오지 못했어요. 다시 시도해주세요.');
    } finally {
      setIsResolving(false);
    }
  }

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
          선택한 상품 {selectedIds.size}개가 저장되지 않습니다.
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

  const isPending = isResolving || addPlannerItemMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={requestClose}
      panelClassName="bg-surface-muted flex h-[80vh] max-w-[900px] flex-col overflow-hidden p-0"
    >
      <div className="flex min-h-0 flex-1 flex-col p-8">
        <h2 className="text-section-title">
          {isCollectionMode
            ? `'${collection.name}'에 위스키 추가`
            : '구매 후보 상품 추가하기'}
        </h2>

        <div className="mt-6 flex min-h-0 flex-1 gap-4">
          {/* 1열: 전체 검색 + 콜렉션들. 콜렉션 모드는 검색만 쓰므로 숨긴다 */}
          {!isCollectionMode && (
            <SourceList
              sourceId={sourceId}
              onSelect={(id) => {
                setSourceId(id);
                setIsSortOpen(false);
              }}
              totalCount={totalCount}
              collections={collections}
              collectionCounts={collectionIds.map(
                (_, index) =>
                  collectionItemQueries[index]?.data?.items.length ?? 0
              )}
            />
          )}

          {/* 2열: 검색창 + 정렬 + 위스키 리스트 */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
            {sourceId === null && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setKeyword(keywordInput);
                }}
                className="flex gap-2"
              >
                <input
                  type="search"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="어떤 위스키를 찾으세요?"
                  aria-label="위스키 검색"
                  className="bg-canvas text-body text-fg placeholder:text-fg-subtle min-w-0 flex-1 rounded-xl px-5 py-3.5 outline-none"
                />
                <button
                  type="submit"
                  aria-label="검색"
                  className="bg-surface-inverse text-fg-on-dark flex size-12 shrink-0 items-center justify-center rounded-xl"
                >
                  <SearchIcon />
                </button>
              </form>
            )}

            {!isCollectionMode && (
              <SortSelect
                sort={sort}
                isOpen={isSortOpen}
                onToggle={() => setIsSortOpen((prev) => !prev)}
                onClose={() => setIsSortOpen(false)}
                onChange={(value) => {
                  setSort(value);
                  setIsSortOpen(false);
                }}
              />
            )}

            <div className="min-h-0 flex-1">
              <WhiskyPickerList
                items={visibleItems}
                // 콜렉션 목록은 이미 받아둔 데이터라 로딩/에러/무한스크롤이 없다
                isLoading={sourceId === null && isSearchLoading}
                isError={sourceId === null && isSearchError}
                onRetry={refetchSearch}
                hasNextPage={sourceId === null && hasNextSearchPage}
                isFetchingNextPage={isFetchingNextSearchPage}
                onLoadMore={fetchNextSearchPage}
                selectedIds={selectedIds}
                onToggle={toggleSelected}
                addedWhiskyIds={isCollectionMode ? addedWhiskyIds : undefined}
                onAddWhisky={
                  isCollectionMode ? handleAddToCollection : undefined
                }
              />
            </div>
          </div>
        </div>

        {errorMessage && (
          <p className="text-caption text-danger mt-2">{errorMessage}</p>
        )}
      </div>

      {/* 버튼 바만 흰 배경이라 회색 본문과 분리된다 */}
      <div className="bg-canvas shrink-0 px-8 py-6">
        {isCollectionMode ? (
          <Button fullWidth onClick={handleClose}>
            완료
          </Button>
        ) : (
          <div className="flex gap-4">
            <Button variant="secondary" fullWidth onClick={requestClose}>
              취소
            </Button>
            <Button
              fullWidth
              disabled={selectedIds.size === 0 || isPending}
              onClick={handleComplete}
            >
              {isPending ? '추가 중...' : `${selectedIds.size}개 상품 추가하기`}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}

/** 왼쪽 목록: 전체 검색 + 콜렉션들. 각 줄 오른쪽에 개수가 붙는다. */
function SourceList({
  sourceId,
  onSelect,
  totalCount,
  collections,
  collectionCounts,
}: {
  sourceId: SourceId;
  onSelect: (id: SourceId) => void;
  totalCount: number;
  collections: { id: number; name: string }[];
  collectionCounts: number[];
}) {
  return (
    <ul className="flex w-56 shrink-0 flex-col gap-1 overflow-y-auto">
      <SourceRow
        label="전체 검색"
        // 서버 총계가 커지면 자릿수가 늘어 레이아웃이 흔들려서 999+로 자른다
        count={totalCount > 999 ? '999+' : totalCount}
        isActive={sourceId === null}
        onClick={() => onSelect(null)}
      />
      {collections.map((collection, index) => (
        <SourceRow
          key={collection.id}
          label={collection.name}
          count={collectionCounts[index] ?? 0}
          isActive={sourceId === collection.id}
          onClick={() => onSelect(collection.id)}
        />
      ))}
    </ul>
  );
}

function SourceRow({
  label,
  count,
  isActive,
  onClick,
}: {
  label: string;
  count: number | string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={isActive}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-xl px-5 py-4 text-left transition-colors',
          isActive
            ? 'bg-canvas text-fg font-bold'
            : 'text-fg-muted hover:bg-surface-sunken'
        )}
      >
        <span className="text-body-sm truncate">{label}</span>
        <span className="text-body-sm shrink-0">({count})</span>
      </button>
    </li>
  );
}

/** 정렬 드롭다운. 바깥 클릭/Esc로 닫힌다. */
function SortSelect({
  sort,
  isOpen,
  onToggle,
  onClose,
  onChange,
}: {
  sort: WhiskySort;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onChange: (sort: WhiskySort) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // 모달 자체의 esc 스택과 겹치지 않게, 드롭다운이 열려 있을 때만 먼저 가로챈다.
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) onClose();
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const label =
    SORT_OPTIONS.find((option) => option.value === sort)?.label ?? '';

  return (
    <div ref={containerRef} className="relative self-end">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="text-body-sm text-fg flex items-center gap-1 underline underline-offset-4"
      >
        {label}
        <ChevronDownIcon className={cn(isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="border-border bg-canvas shadow-overlay absolute right-0 z-10 mt-2 flex flex-col rounded-lg border p-1">
          {SORT_OPTIONS.map(({ label: optionLabel, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange(value)}
              className={cn(
                'text-body-sm hover:bg-surface-muted rounded px-3 py-1.5 text-left whitespace-nowrap',
                sort === value && 'font-bold'
              )}
            >
              {optionLabel}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * 위스키 목록. 체크박스로 여러 개를 고른다. 판매처는 고르지 않고,
 * 추가 후 플래너 행의 판매처 드롭다운에서 바꾼다.
 */
function WhiskyPickerList({
  items,
  isLoading,
  isError,
  onRetry,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  selectedIds,
  onToggle,
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
  selectedIds: Set<number>;
  onToggle: (whiskyId: number) => void;
  /** 넘어오면 콜렉션 모드: 체크박스 대신 행마다 담기 버튼을 그린다. */
  addedWhiskyIds?: Set<number>;
  onAddWhisky?: (whisky: WhiskyListItem) => void;
}) {
  const sentinelRef = useRef<HTMLLIElement>(null);
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
      <div className="bg-canvas text-caption text-fg-muted flex h-full items-center justify-center rounded-2xl">
        불러오는 중...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-canvas text-caption text-fg-muted flex h-full flex-col items-center justify-center gap-2 rounded-2xl">
        <p>일시적인 오류가 발생했습니다</p>
        <button type="button" onClick={onRetry} className="underline">
          다시 시도
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-canvas text-caption text-fg-muted flex h-full items-center justify-center rounded-2xl">
        해당하는 상품이 없습니다
      </div>
    );
  }

  return (
    <ul className="bg-canvas h-full overflow-y-auto rounded-2xl p-3">
      {items.map((whisky) => (
        <li key={whisky.id} className="py-1">
          <div className="flex items-center gap-3">
            {isCollectionMode ? (
              <>
                <HorizontalCard
                  product={whiskyToProduct(whisky)}
                  variant="compact"
                  className="min-w-0 flex-1"
                />
                <button
                  type="button"
                  disabled={addedWhiskyIds?.has(whisky.id)}
                  onClick={() => onAddWhisky?.(whisky)}
                  className="border-border-strong text-caption w-16 shrink-0 rounded-full border py-1.5 disabled:opacity-30"
                >
                  {addedWhiskyIds?.has(whisky.id) ? '담김' : '담기'}
                </button>
              </>
            ) : (
              /* 카드 전체가 체크 토글이다. label로 감싸면 카드 안 이미지까지
                 클릭 영역이 되어 행 어디를 눌러도 선택된다. */
              <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                <Checkbox
                  checked={selectedIds.has(whisky.id)}
                  onChange={() => onToggle(whisky.id)}
                  aria-label={whisky.name}
                  className="ml-1 [&_span]:size-7"
                />
                <HorizontalCard
                  product={whiskyToProduct(whisky)}
                  variant="compact"
                  className="min-w-0 flex-1"
                />
              </label>
            )}
          </div>
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

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className="size-6"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-4 transition-transform', className)}
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
