'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSaveItemModal } from '@/components/common/SaveItemModal';
import { rememberCurrentPath } from '@/lib/login-return';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/use-auth-store';
import { Product } from '@/types/product';

interface VerticalCardProps {
  product: Product;
  loading?: 'eager' | 'lazy';
  className?: string;
  href?: string;
  /**
   * 저장 버튼을 "저장됨"으로 그린다. 관심목록 페이지처럼 이미 담긴 게
   * 확실한 화면에서 쓴다. 생략하면 기존대로 저장 모달을 여는 버튼이 된다.
   */
  isSaved?: boolean;
  /** isSaved일 때 버튼을 누르면 실행된다. 없으면 저장 모달을 연다. */
  onUnsave?: () => void;
  /** 제거 요청 중 버튼을 잠근다. */
  isUnsaving?: boolean;
}

export function VerticalCard({
  product,
  loading = 'lazy',
  className,
  href,
  isSaved,
  onUnsave,
  isUnsaving,
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
        'border-border bg-canvas flex w-full flex-col overflow-hidden rounded-lg border transition-transform duration-[180ms] ease-[var(--ease-spring-soft)] active:scale-[0.99]',
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
          <div className="bg-surface-sunken text-body-sm text-fg-subtle flex h-full w-full items-center justify-center text-center">
            {/* TODO: 이미지 로딩 실패 시 표시할 내용 추가 */}
            이미지 로딩 실패
          </div>
        )}
        {discountRate !== 0 && (
          <span className="text-primary bg-canvas text-price-discount absolute bottom-0 left-0 rounded-tr-lg px-3 py-1.5">
            {discountRate}%
          </span>
        )}
        <div className="absolute right-2 bottom-2">
          <BookmarkButton
            product={product}
            isSaved={isSaved}
            onUnsave={onUnsave}
            isUnsaving={isUnsaving}
          />
        </div>
      </div>
      <div className="bg-surface-muted flex flex-1 flex-col px-4 py-3">
        <p className="text-card-title truncate">{name}</p>
        {originalName && (
          <p className="text-body-sm text-fg-muted truncate">{originalName}</p>
        )}
        <p className="text-price mt-2">
          {displayPrice
            ? `${displayPrice.toLocaleString('ko-KR')}원`
            : '가격 정보 없음'}
          {showYen && (
            <span className="text-price-sub text-fg-muted">
              ({jpPriceYen?.toLocaleString('ko-KR')}엔)
            </span>
          )}
        </p>
        {/* TODO: "대중적인 브랜드" 등 태그 문구 — API 필드 확정 후 volumeMl 뒤에 ` · ` 구분자로 추가 */}
        {volumeMl ? (
          <p className="text-price-sub text-fg-muted mt-2">
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

function BookmarkButton({
  product,
  isSaved = false,
  onUnsave,
  isUnsaving = false,
}: {
  product: Product;
  // TODO: 목록/검색 화면의 저장 여부는 컬렉션 조회 API 연동 후 서버 상태로 채운다
  isSaved?: boolean;
  onUnsave?: () => void;
  isUnsaving?: boolean;
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { open: openSaveItemModal } = useSaveItemModal();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.id === undefined) return;

    // 이미 담긴 항목이면 모달을 열지 않고 바로 뺀다.
    if (isSaved && onUnsave) {
      onUnsave();
      return;
    }

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
    rememberCurrentPath(
      product.id === undefined
        ? undefined
        : {
            id: product.id,
            name: product.name,
            originalName: product.originalName,
            imageUrl: product.imageUrl,
          }
    );
    router.push('/login');
  };

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={handleLoginRedirect}
        aria-label="로그인이 필요해요"
        className="border-border bg-canvas text-fg flex size-8 shrink-0 items-center justify-center rounded-md border"
      >
        <BookmarkIcon filled={false} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isUnsaving}
      aria-pressed={isSaved}
      aria-label={isSaved ? '관심 목록에서 빼기' : '저장하기'}
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-md border disabled:opacity-50',
        isSaved
          ? 'border-border-inverse bg-surface-inverse text-fg-on-dark'
          : 'border-border bg-canvas text-fg'
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
