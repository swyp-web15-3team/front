'use client';

import { useRef } from 'react';
import { VerticalCard } from '@/components/ui/VerticalCard';
import { cn } from '@/lib/utils';
import { Product } from '@/types/product';

const ARROW_SCROLL_PX = 320;
const DRAG_THRESHOLD_PX = 5; // 이 값 이하 이동은 클릭으로 간주해 카드 링크 이동을 막지 않음

interface CurationScrollerProps {
  items: Array<{ id: number; product: Product }>;
  className?: string;
}

export function CurationScroller({ items, className }: CurationScrollerProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{ startX: number; scrollLeft: number } | null>(
    null
  );
  const suppressClickRef = useRef(false);

  const scrollByPx = (delta: number) => {
    trackRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const track = trackRef.current;
    if (!track) return;
    dragStateRef.current = { startX: e.clientX, scrollLeft: track.scrollLeft };
    track.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const dragState = dragStateRef.current;
    const track = trackRef.current;
    if (!dragState || !track) return;

    const delta = e.clientX - dragState.startX;
    if (Math.abs(delta) > DRAG_THRESHOLD_PX) {
      suppressClickRef.current = true;
    }
    track.scrollLeft = dragState.scrollLeft - delta;
  };

  const endDrag = (e: React.PointerEvent) => {
    dragStateRef.current = null;
    trackRef.current?.releasePointerCapture(e.pointerId);
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (suppressClickRef.current) {
      e.preventDefault();
      e.stopPropagation();
      suppressClickRef.current = false;
    }
  };

  return (
    <div className={cn('group relative', className)}>
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory scrollbar-none gap-4 overflow-x-auto scroll-smooth pb-2 select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={handleClickCapture}
      >
        {items.map(({ id, product }) => (
          <VerticalCard
            key={id}
            product={product}
            className="w-40 shrink-0 snap-start sm:w-52"
          />
        ))}
      </div>

      <ArrowButton
        direction="left"
        onClick={() => scrollByPx(-ARROW_SCROLL_PX)}
      />
      <ArrowButton
        direction="right"
        onClick={() => scrollByPx(ARROW_SCROLL_PX)}
      />
    </div>
  );
}

function ArrowButton({
  direction,
  onClick,
}: {
  direction: 'left' | 'right';
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={direction === 'left' ? '이전' : '다음'}
      onClick={onClick}
      className={cn(
        'absolute top-1/2 hidden -translate-y-1/2 rounded-full border border-gray-200 bg-white p-1.5 opacity-0 shadow-md transition-opacity group-hover:opacity-100 sm:block',
        direction === 'left'
          ? 'left-0 -translate-x-1/2'
          : 'right-0 translate-x-1/2'
      )}
    >
      <svg
        viewBox="0 0 24 24"
        width={20}
        height={20}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className={direction === 'left' ? 'rotate-180' : undefined}
      >
        <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
