'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { FilterBar } from '@/app/(main)/search/_components/FilterBar';
import { ProductGrid } from '@/components/common/ProductGrid';
import {
  useWhiskyCategoryListQuery,
  useWhiskyListQuery,
} from '@/hooks/queries/use-whisky';
import {
  parseSearchFilters,
  toWhiskyListParams,
  writeSearchFilters,
} from '@/lib/search-filter';
import { whiskyToProduct } from '@/lib/utils';
import { SearchFilters } from '@/types/search';
import { WhiskySort } from '@/types/whisky';

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-100 items-center justify-center">
          <p>불러오는 중...</p>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q')?.trim() ?? '';

  // q는 필수 — 없으면 API를 호출하지 않고 이동 안내만 보여준다
  if (!query) return <MissingQuery />;

  // 새 검색어로 이동하면 이전 검색의 필터·정렬을 버리고 URL에서 다시 읽는다
  return <SearchResults key={query} query={query} />;
}

function MissingQuery() {
  const router = useRouter();

  // 직접 URL로 진입해 이전 기록이 없으면 back이 동작하지 않으므로 홈으로 보낸다
  const handleBack = () => {
    if (window.history.length > 1) router.back();
    else router.replace('/');
  };

  return (
    <div className="flex min-h-100 flex-col items-center justify-center gap-4">
      <p>검색어를 입력해주세요</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleBack}
          className="border-border-strong text-button text-fg min-h-11 rounded-md border px-4 py-2"
        >
          뒤로 가기
        </button>
        <Link
          href="/"
          className="border-border-strong text-button text-fg min-h-11 rounded-md border px-4 py-2"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}

interface SearchResultsProps {
  query: string;
}

const DEFAULT_SORT: WhiskySort = 'name,asc';
const SORTS: WhiskySort[] = ['name,asc', 'name,desc', 'id,asc', 'id,desc'];

function parseSort(value: string | null): WhiskySort {
  return SORTS.find((sort) => sort === value) ?? DEFAULT_SORT;
}

function SearchResults({ query }: SearchResultsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 진입(뒤로가기 포함) 시 URL에서 필터·정렬을 복원한다. 이후 변경은 state가 즉시
  // 반영하고 URL은 따라서 갱신한다 — URL만 원본으로 두면 연속 클릭 시 이전 값이
  // 반영되기 전에 다음 변경이 계산돼 선택이 유실된다
  const [filters, setFiltersState] = useState(() =>
    parseSearchFilters(searchParams)
  );
  const [sort, setSortState] = useState(() =>
    parseSort(searchParams.get('sort'))
  );

  // 페이지 이동 없이 주소만 바꾸고, 방문 기록이 쌓이지 않게 replace로 덮어쓴다
  const syncUrl = (nextFilters: SearchFilters, nextSort: WhiskySort) => {
    const params = new URLSearchParams({ q: query });
    if (nextSort !== DEFAULT_SORT) params.set('sort', nextSort);
    window.history.replaceState(
      null,
      '',
      `${pathname}?${writeSearchFilters(params, nextFilters)}`
    );
  };

  const setFilters = (next: SearchFilters) => {
    setFiltersState(next);
    syncUrl(next, sort);
  };

  const setSort = (next: WhiskySort) => {
    setSortState(next);
    syncUrl(filters, next);
  };

  const { data: categoryData } = useWhiskyCategoryListQuery();

  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useWhiskyListQuery(
    {
      query,
      sort,
      ...toWhiskyListParams(filters, categoryData?.categories ?? []),
    },
    // 필터·정렬을 바꿀 때마다 결과가 "불러오는 중"으로 비었다가 다시 그려지지 않게 한다.
    // 검색어가 바뀌면 SearchResults가 key로 새로 마운트되므로 이전 검색 결과는 남지 않는다
    { keepPreviousResults: true }
  );

  const items =
    data?.pages.flatMap((page) => page.content.map(whiskyToProduct)) ?? [];

  return (
    <div className="mx-auto flex max-w-300 flex-col gap-4">
      <FilterBar
        sort={sort}
        onSortChange={setSort}
        filters={filters}
        onFiltersChange={setFilters}
      />
      {isLoading ? (
        <div className="flex min-h-100 items-center justify-center">
          <p>불러오는 중...</p>
        </div>
      ) : isError ? (
        <div className="flex min-h-100 flex-col items-center justify-center gap-2">
          <p>일시적인 오류가 발생했습니다</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-body-sm text-fg-muted hover:text-fg underline"
          >
            다시 시도
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex min-h-100 items-center justify-center">
          <p>상품이 없습니다</p>
        </div>
      ) : (
        <>
          <ProductGrid
            items={items}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={fetchNextPage}
          />
        </>
      )}
    </div>
  );
}
