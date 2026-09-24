'use client';

import { useRef } from 'react';
import { cn } from '@/lib/utils';

const ARROW_SCROLL_PX = 320;
const DRAG_THRESHOLD_PX = 5; // 이 값 이하 이동은 클릭으로 간주해 카드 링크 이동을 막지 않음

interface HorizontalScrollerProps {
  /** 트랙에 가로로 늘어놓을 카드들. 각 카드에 `shrink-0 snap-start`를 붙인다 */
  children: React.ReactNode;
  /**
   * 포인터로 트랙을 잡아끌어 스크롤할지 여부.
   * HTML5 `draggable` 카드를 넣을 때는 false — 포인터 캡처가 drag를 가로챈다.
   */
  dragScroll?: boolean;
  /** 좌우 화살표 버튼 노출 여부 */
  showArrows?: boolean;
  /** 바깥 래퍼(화살표 기준 컨테이너) */
  className?: string;
  /** 스크롤 트랙 자체. gap 조정 등에 쓴다 */
  trackClassName?: string;
}

/**
 * 가로 스크롤 트랙 + 좌우 화살표 + (옵션) 드래그 스크롤.
 * 카드 종류를 모르는 UI 프리미티브라, 무엇을 담을지는 children이 정한다.
 */
export function HorizontalScroller({
  children,
  dragScroll = true,
  showArrows = true,
  className,
  trackClassName,
}: HorizontalScrollerProps) {
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
    if (!track || !dragScroll) return;
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

  // 드래그로 끝난 포인터 조작은 클릭으로 이어지지 않게 한 번 삼킨다
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
        className={cn(
          'flex snap-x snap-mandatory scrollbar-none gap-4 overflow-x-auto scroll-smooth pb-2',
          dragScroll && 'select-none',
          trackClassName
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={handleClickCapture}
      >
        {children}
      </div>

      {showArrows && (
        <>
          <ArrowButton
            direction="left"
            onClick={() => scrollByPx(-ARROW_SCROLL_PX)}
          />
          <ArrowButton
            direction="right"
            onClick={() => scrollByPx(ARROW_SCROLL_PX)}
          />
        </>
      )}
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
