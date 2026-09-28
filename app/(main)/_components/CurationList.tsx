'use client';

import { ProductGrid } from '@/components/common/ProductGrid';
import { useCurationListQuery } from '@/hooks/queries/use-curation';
import { whiskyToProduct } from '@/lib/utils';

export function CurationList() {
  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useCurationListQuery();

  const title = data?.pages[0]?.title;
  const items =
    data?.pages.flatMap((page) => page.content.map(whiskyToProduct)) ?? [];

  if (isLoading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <p className="text-body text-fg-muted">불러오는 중...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center gap-2">
        <p className="text-body text-fg-muted">일시적인 오류가 발생했습니다</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="text-body-sm text-fg-muted hover:text-fg underline"
        >
          다시 시도
        </button>
      </div>
    );
  }

  // 주제가 없거나 멤버가 없으면 content는 []
  if (items.length === 0) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <p className="text-body text-fg-muted">상품이 없습니다</p>
      </div>
    );
  }

  return (
    <section>
      {title && <h2 className="text-section-title mb-4">{title}</h2>}
      <ProductGrid
        items={items}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={fetchNextPage}
      />
    </section>
  );
}
