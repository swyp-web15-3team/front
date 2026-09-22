'use client';

import Link from 'next/link';

import { ProductGrid } from '@/components/common/ProductGrid';
import { useWhiskyListQuery } from '@/hooks/queries/use-whisky';
import { Product } from '@/types/product';
import { WhiskyListItem } from '@/types/whisky';

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

export function WhiskyList() {
  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useWhiskyListQuery();

  const items =
    data?.pages.flatMap((page) => page.content.map(toProduct)) ?? [];

  if (isLoading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <p>불러오는 중...</p>
      </div>
    );
  }

  if (isError) {
    return (
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
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <p>상품이 없습니다</p>
      </div>
    );
  }

  return (
    <ProductGrid
      items={items}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      onLoadMore={fetchNextPage}
      endContent={
        <Link href="/search" className="text-sm font-medium underline">
          더 많은 상품 보러가기 →
        </Link>
      }
    />
  );
}
