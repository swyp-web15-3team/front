'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { FilterBar } from '@/app/(main)/search/_components/FilterBar';
import { ProductGrid } from '@/components/common/ProductGrid';
import { useWhiskyListQuery } from '@/hooks/queries/use-whisky';
import { whiskyToProduct } from '@/lib/utils';
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

  return <SearchResults query={query} />;
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
          className="rounded border px-4 py-2 text-sm"
        >
          뒤로 가기
        </button>
        <Link href="/" className="rounded border px-4 py-2 text-sm">
          홈으로
        </Link>
      </div>
    </div>
  );
}

interface SearchResultsProps {
  query: string;
}

function SearchResults({ query }: SearchResultsProps) {
  const [sort, setSort] = useState<WhiskySort>('name,asc');
  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useWhiskyListQuery({ query, sort });

  const items =
    data?.pages.flatMap((page) => page.content.map(whiskyToProduct)) ?? [];

  return (
    <div className="mx-auto max-w-300">
      <FilterBar sort={sort} onSortChange={setSort} />
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
            className="text-sm underline"
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
          <p>{items.length}개 불러옴</p>
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
