'use client';

import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { VerticalCard } from '@/components/ui/VerticalCard';
import { Product } from '@/types/product';

interface ProductGridProps {
  items: Product[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

// Tailwind 기본 브레이크포인트(md/lg/xl)와 맞춰 한 행에 들어갈 카드 수를 결정한다
const COLUMN_BREAKPOINTS: Array<[minWidth: number, columns: number]> = [
  [1280, 5],
  [1024, 4],
  [768, 3],
  [0, 2],
];

const ROW_GAP_PX = 16;
const ESTIMATED_ROW_HEIGHT_PX = 340;

function getColumnCount(width: number) {
  const match = COLUMN_BREAKPOINTS.find(([minWidth]) => width >= minWidth);
  return match ? match[1] : 2;
}

function useColumnCount() {
  const [columns, setColumns] = useState(() =>
    typeof window === 'undefined' ? 2 : getColumnCount(window.innerWidth)
  );

  useEffect(() => {
    const handleResize = () => setColumns(getColumnCount(window.innerWidth));
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return columns;
}

function chunk<T>(list: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < list.length; i += size) {
    rows.push(list.slice(i, i + size));
  }
  return rows;
}

export function ProductGrid({
  items,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: ProductGridProps) {
  const columns = useColumnCount();
  const rows = useMemo(() => chunk(items, columns), [items, columns]);

  const parentRef = useRef<HTMLDivElement>(null);
  const [parentOffset, setParentOffset] = useState(0);

  useLayoutEffect(() => {
    const measure = () => setParentOffset(parentRef.current?.offsetTop ?? 0);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => ESTIMATED_ROW_HEIGHT_PX,
    overscan: 3,
    gap: ROW_GAP_PX,
    scrollMargin: parentOffset,
  });

  // 실제 로드된 데이터 총 높이 아래에 감시용 sentinel을 두어, 가상화 여부와 무관하게
  // 사용자가 리스트 끝에 가까워지면 다음 페이지를 요청한다
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  return (
    <div>
      <div
        ref={parentRef}
        className="relative w-full"
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            ref={virtualizer.measureElement}
            data-index={virtualRow.index}
            className="absolute top-0 left-0 grid w-full gap-4"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              transform: `translateY(${virtualRow.start - parentOffset}px)`,
            }}
          >
            {rows[virtualRow.index].map((product, colIndex) => (
              <VerticalCard
                key={`${virtualRow.index}-${colIndex}`}
                product={product}
              />
            ))}
          </div>
        ))}
      </div>

      <div ref={sentinelRef} aria-hidden className="h-px w-full" />

      <div className="flex justify-center py-6 text-sm text-gray-500">
        {isFetchingNextPage && <p>불러오는 중...</p>}
        {!hasNextPage && !isFetchingNextPage && items.length > 0 && (
          <p>마지막 상품입니다</p>
        )}
      </div>
    </div>
  );
}
