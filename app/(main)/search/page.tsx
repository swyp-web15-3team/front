'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import { FilterBar } from '@/app/(main)/search/_components/FilterBar';
import { ProductGrid } from '@/components/common/ProductGrid';
import { useWhiskyListQuery } from '@/hooks/queries/use-whisky';
import { Product } from '@/types/product';
import { WhiskyListItem } from '@/types/whisky';

// TODO: WhiskyList.tsx, CollectionView.tsx의 toProduct와 중복 — 공용 위치로 추출 필요
function toProduct(whisky: WhiskyListItem): Product {
  return {
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
  const query = searchParams.get('q') ?? '';
  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useWhiskyListQuery({ query });

  const items =
    data?.pages.flatMap((page) => page.content.map(toProduct)) ?? [];

  return (
    <div className="mx-auto max-w-300">
      <FilterBar />
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
