'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSaveItemModal } from '@/components/common/SaveItemModal';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/use-auth-store';
import { Product } from '@/types/product';

interface VerticalCardProps {
  product: Product;
  loading?: 'eager' | 'lazy';
  className?: string;
}

export function VerticalCard({
  product,
  loading = 'lazy',
  className,
}: VerticalCardProps) {
  const {
    imageUrl = '', // 추후 기본 이미지 URL로 변경 가능
    name,
    originalName,
    discountRate = 0,
    krPrice,
    jpPrice,
    jpPriceYen,
    volumeMl,
  } = product;
  const [hasError, setHasError] = useState(false);

  return (
    <>
      <div
        className={cn(
          'shadow-m1 flex w-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white',
          className
        )}
      >
        <div className="relative aspect-4/3 w-full">
          {imageUrl && !hasError ? (
            <Image
              src={imageUrl}
              alt={`${name} ${originalName}` || ''}
              fill
              sizes="(max-width: 768px) 50vw, 240px"
              loading={loading}
              className="rounded-xl object-cover"
              onError={() => setHasError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-gray-100 text-center text-gray-400">
              {/* TODO: 이미지 로딩 실패 시 표시할 내용 추가 */}
              이미지 로딩 실패
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="text-lg">{name}</p>
            <BookmarkButton product={product} />
          </div>
          <p className="text-gray-500">{originalName}</p>
          <p className="text-lg text-[#EC4B4B]">{discountRate}%</p>
          <div className="flex justify-between">
            <span>한국가</span>
            <span>{krPrice?.toLocaleString('ko-KR')}원</span>
          </div>
          <div className="flex justify-between">
            <span>일본가</span>
            <span>{jpPrice?.toLocaleString('ko-KR')}원</span>
          </div>
          {/* <p className="text-right text-xs text-gray-500">
            (¥{jpPriceYen?.toLocaleString('ko-KR')})
          </p> */}
          <p className="text-left text-xs text-gray-500">
            {volumeMl ? `${volumeMl.toLocaleString('ko-KR')}ml` : ''}
          </p>
        </div>
      </div>
    </>
  );
}

function BookmarkButton({ product }: { product: Product }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { open: openSaveItemModal } = useSaveItemModal();
  // TODO: 저장 여부는 컬렉션 조회 API 연동 후 서버 상태로 교체
  const isSaved = false;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.id === undefined) return;

    openSaveItemModal({
      id: product.id,
      name: product.name,
      originalName: product.originalName,
      imageUrl: product.imageUrl,
    });
  };

  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        onClick={(e) => e.stopPropagation()}
        aria-label="로그인이 필요해요"
        className="flex size-8 shrink-0 items-center justify-center rounded-md border border-black text-black"
      >
        <BookmarkIcon filled={false} />
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isSaved ? '저장 취소' : '저장하기'}
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-md border',
        isSaved ? 'border-black bg-black text-white' : 'border-black text-black'
      )}
    >
      <BookmarkIcon filled={isSaved} />
    </button>
  );
}

// TODO: 추후 아이콘 라이브러리로 교체
function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
      aria-hidden="true"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
