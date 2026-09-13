'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface Banner {
  id: string;
  imageUrl: string;
  badge: string;
  changeRate: number;
  nameEn: string;
  nameKr: string;
  krAvgPrice: number;
  jpLowestPriceYen: number;
  jpLowestPriceKr: number;
  href: string;
}

interface HeroBannerCarouselProps {
  banners: Banner[];
  className?: string;
}

const AUTOPLAY_INTERVAL_MS = 4000; // 자동 슬라이드 전환 간격
const DRAG_THRESHOLD_PX = 50; // 이 값 이상 드래그해야 슬라이드가 전환됨
const DOT_WINDOW_SIZE = 5; // 활성 닷 기준으로 동시에 보여줄 닷 개수
const DOT_SIZE_BY_DISTANCE_PX = [6, 5, 4]; // 활성 닷과의 거리(0, 1, 2...)에 따른 지름
const DOT_GAP_PX = 6; // 닷 사이 간격

export function HeroBannerCarousel({
  banners,
  className,
}: HeroBannerCarouselProps) {
  const hasBanners = banners.length > 0;

  // 앞뒤로 클론을 붙여 무한 루프를 자연스럽게 이어지도록 한다 (예: [마지막, 0, 1, ..., n-1, 0])
  const slides = hasBanners
    ? [banners[banners.length - 1], ...banners, banners[0]]
    : [];
  const [index, setIndex] = useState(1);
  const [isAnimating, setIsAnimating] = useState(true);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDotsHovered, setIsDotsHovered] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dragStateRef = useRef<{ startX: number; dragging: boolean } | null>(
    null
  );
  const suppressClickRef = useRef(false);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIsAnimating(true);
      setIndex((prev) => prev + 1);
    }, AUTOPLAY_INTERVAL_MS);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    resetTimer();
    return stopTimer;
  }, []);

  // 클론 슬라이드에 도달하면 트랜지션 없이 실제 슬라이드로 순간 이동시켜 무한 루프처럼 보이게 한다
  const handleTransitionEnd = () => {
    if (index === slides.length - 1) {
      setIsAnimating(false);
      setIndex(1);
    } else if (index === 0) {
      setIsAnimating(false);
      setIndex(slides.length - 2);
    }
  };

  useEffect(() => {
    if (!isAnimating) {
      const id = requestAnimationFrame(() => setIsAnimating(true));
      return () => cancelAnimationFrame(id);
    }
  }, [isAnimating]);

  const goTo = (nextIndex: number) => {
    setIsAnimating(true);
    setIndex(nextIndex);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStateRef.current = { startX: e.clientX, dragging: true };
    stopTimer();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const dragState = dragStateRef.current;
    if (!dragState?.dragging) return;
    setDragOffset(e.clientX - dragState.startX);
  };

  const endDrag = () => {
    const dragState = dragStateRef.current;
    if (!dragState?.dragging) return;
    dragState.dragging = false;

    if (dragOffset <= -DRAG_THRESHOLD_PX) {
      suppressClickRef.current = true;
      goTo(index + 1);
    } else if (dragOffset >= DRAG_THRESHOLD_PX) {
      suppressClickRef.current = true;
      goTo(index - 1);
    }
    setDragOffset(0);
    resetTimer();
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (suppressClickRef.current) {
      e.preventDefault();
      e.stopPropagation();
      suppressClickRef.current = false;
    }
  };

  if (!hasBanners) return null;

  // 배너가 1개면 슬라이드/드래그/닷 없이 카드만 보여준다
  if (banners.length === 1) {
    return (
      <div
        className={cn(
          'relative aspect-square w-full min-[992px]:aspect-auto min-[992px]:h-87.5',
          className
        )}
      >
        <BannerCard banner={banners[0]} />
      </div>
    );
  }

  const realIndex = (index - 1 + banners.length) % banners.length;

  const windowSize = Math.min(DOT_WINDOW_SIZE, banners.length);
  const windowStart = Math.min(
    Math.max(realIndex - Math.floor(windowSize / 2), 0),
    banners.length - windowSize
  );
  const windowEnd = windowStart + windowSize - 1;

  return (
    <div
      className={cn('relative w-full', className)}
      onMouseEnter={stopTimer}
      onMouseLeave={resetTimer}
    >
      <div className="overflow-hidden">
        <div
          className={cn(
            'flex touch-pan-y',
            isAnimating && 'transition-transform duration-300 ease-out'
          )}
          style={{
            transform: `translateX(calc(${-index * 100}% + ${dragOffset}px))`,
          }}
          onTransitionEnd={handleTransitionEnd} // 클론 슬라이드 도달 시 실제 위치로 순간 이동
          onPointerDown={handlePointerDown} // 드래그 시작 위치 기록, 오토플레이 정지
          onPointerMove={handlePointerMove} // 드래그 중 이동량(dragOffset) 갱신
          onPointerUp={endDrag} // 드래그 종료, 임계값 넘으면 슬라이드 전환
          onPointerCancel={endDrag} // 브라우저가 드래그를 취소한 경우(예: 스크롤 개입) 종료 처리
          onPointerLeave={endDrag} // 포인터가 영역을 벗어난 경우 종료 처리
          onClickCapture={handleClickCapture} // 드래그 직후 발생하는 의도치 않은 클릭(Link 이동) 차단
        >
          {slides.map((banner, i) => (
            <div
              key={`${banner.id}-${i}`}
              className="aspect-square w-full shrink-0 min-[992px]:aspect-auto min-[992px]:h-87.5"
            >
              <BannerCard banner={banner} />
            </div>
          ))}
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Slide dots"
        className="absolute bottom-4.5 left-1/2 flex -translate-x-1/2 items-center"
        onMouseEnter={() => setIsDotsHovered(true)}
        onMouseLeave={() => setIsDotsHovered(false)}
      >
        {banners.map((_, i) => {
          const isVisible =
            isDotsHovered || (i >= windowStart && i <= windowEnd);
          const distance = Math.min(
            Math.abs(i - realIndex),
            DOT_SIZE_BY_DISTANCE_PX.length - 1
          );
          const isActive = i === realIndex;
          const size = isVisible
            ? isActive
              ? DOT_SIZE_BY_DISTANCE_PX[0]
              : DOT_SIZE_BY_DISTANCE_PX[distance]
            : 0;

          return (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Slide dot ${i + 1}`}
              onClick={() => goTo(i + 1)}
              className={cn(
                'rounded-[1000px] transition-all duration-200',
                isActive ? 'bg-white' : 'bg-white/52'
              )}
              style={{
                width: size,
                height: size,
                marginRight:
                  isVisible && i !== banners.length - 1 ? DOT_GAP_PX : 0,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function BannerCard({ banner }: { banner: Banner }) {
  const isFalling = banner.changeRate < 0;

  return (
    <Link
      href={banner.href}
      draggable={false}
      className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl bg-gray-600 px-5 pt-5 pb-10.75 select-none"
    >
      <div className="flex items-center gap-1.5">
        <span className="rounded-full border border-purple-300 px-2 py-1 text-xs font-medium text-purple-300">
          {banner.badge}
        </span>
        <span
          className={cn(
            'text-xs font-medium',
            isFalling ? 'text-blue-400' : 'text-red-400'
          )}
        >
          {isFalling ? '' : '+'}
          {banner.changeRate}% {isFalling ? '하락' : '상승'}
        </span>
      </div>

      <div className="relative flex flex-1 items-center justify-between gap-2">
        <div className="z-10 flex flex-col gap-1">
          <p className="text-lg font-semibold text-white">{banner.nameEn}</p>
          <p className="text-lg font-semibold text-white">{banner.nameKr}</p>
        </div>
        <div className="relative h-full w-2/5 shrink-0">
          <Image
            src={banner.imageUrl}
            alt={banner.nameEn}
            fill
            sizes="34vw"
            draggable={false}
            className="pointer-events-none object-contain"
          />
        </div>
      </div>

      <div className="z-10 flex items-end justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-xs text-white/60">국내 평균 가격</p>
          <p className="text-sm text-white/60 line-through">
            {banner.krAvgPrice.toLocaleString('ko-KR')}원
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <p className="text-xs text-white/60">일본 최저가</p>
          <p className="text-lg font-bold text-white">
            ¥{banner.jpLowestPriceYen.toLocaleString('ko-KR')}{' '}
            <span className="text-sm font-medium text-white/85">
              (약 {banner.jpLowestPriceKr.toLocaleString('ko-KR')}원)
            </span>
          </p>
        </div>
      </div>
    </Link>
  );
}
