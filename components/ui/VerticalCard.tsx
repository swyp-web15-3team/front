'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSaveItemModal } from '@/components/common/SaveItemModal';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/use-auth-store';
import { Product } from '@/types/product';

interface VerticalCardProps {
  product: Product;
  loading?: 'eager' | 'lazy';
  className?: string;
  href?: string;
}

export function VerticalCard({
  product,
  loading = 'lazy',
  className,
  href,
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

  // 일본가(원화 환산 + 엔화)를 우선 표시하고, 일본가가 없으면 한국가를 표시한다
  const displayPrice = jpPrice || krPrice;
  const showYen = Boolean(jpPrice && jpPriceYen);

  const card = (
    <div
      className={cn(
        'flex w-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white',
        className
      )}
    >
      <div className="relative aspect-square w-full">
        {imageUrl && !hasError ? (
          <Image
            src={imageUrl}
            alt={originalName ? `${name} ${originalName}` : name}
            fill
            sizes="(max-width: 768px) 50vw, 240px"
            loading={loading}
            className="object-contain"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-center text-sm text-gray-400">
            {/* TODO: 이미지 로딩 실패 시 표시할 내용 추가 */}
            이미지 로딩 실패
          </div>
        )}
        {discountRate !== 0 && (
          <span className="text-brand absolute bottom-0 left-0 rounded-tr-xl bg-white px-3 py-1.5 text-sm font-medium">
            {discountRate}%
          </span>
        )}
        <div className="absolute right-2 bottom-2">
          <BookmarkButton product={product} />
        </div>
      </div>
      <div className="flex flex-1 flex-col bg-gray-50 px-4 py-3">
        <p className="truncate font-medium">{name}</p>
        {originalName && (
          <p className="truncate text-gray-500">{originalName}</p>
        )}
        <p className="mt-2 font-medium">
          {displayPrice
            ? `${displayPrice.toLocaleString('ko-KR')}원`
            : '가격 정보 없음'}
          {showYen && (
            <span className="text-xs font-normal text-gray-500">
              ({jpPriceYen?.toLocaleString('ko-KR')}엔)
            </span>
          )}
        </p>
        {/* TODO: "대중적인 브랜드" 등 태그 문구 — API 필드 확정 후 volumeMl 뒤에 ` · ` 구분자로 추가 */}
        {volumeMl ? (
          <p className="mt-2 text-xs text-gray-500">
            {volumeMl.toLocaleString('ko-KR')}ml
          </p>
        ) : null}
      </div>
    </div>
  );

  if (!href) return card;

  return (
    <Link href={href} className="block w-full">
      {card}
    </Link>
  );
}

function BookmarkButton({ product }: { product: Product }) {
  const router = useRouter();
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

  // 카드 전체가 Link일 수 있어 중첩 <a>를 피하려고 button + router.push로 이동한다
  const handleLoginRedirect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push('/login');
  };

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={handleLoginRedirect}
        aria-label="로그인이 필요해요"
        className="flex size-8 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-black"
      >
        <BookmarkIcon filled={false} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isSaved ? '저장 취소' : '저장하기'}
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-md border',
        isSaved
          ? 'border-black bg-black text-white'
          : 'border-gray-200 bg-white text-black'
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
