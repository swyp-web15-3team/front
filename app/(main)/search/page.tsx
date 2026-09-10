'use client';

import { ProductGrid } from '@/app/(main)/search/_components/ProductGrid';
import { useProductListQuery } from '@/hooks/queries/use-product';

export default function SearchPage() {
  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useProductListQuery();

  const items = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="mx-auto max-w-300">
      <input
        type="text"
        placeholder="검색하세요"
        className="mb-4 w-full bg-gray-200 p-2"
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
