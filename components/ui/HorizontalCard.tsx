'use client';

import { useState } from 'react';
import Image from 'next/image';
import { DEFAULT_WHISKY_IMAGE } from '@/constants/images';
import { cn, formatAmount } from '@/lib/utils';
import { Product } from '@/types/product';

interface HorizontalCardProps {
  product: Product;
  loading?: 'eager' | 'lazy';
  /**
   * compact: 모달 목록용. 테두리/배경 없이 리스트 위에 바로 얹히고,
   * 최저가 라벨 대신 원화 한 줄 + 엔화·용량 한 줄로 줄인다.
   */
  variant?: 'default' | 'compact';
  className?: string;
}

export function HorizontalCard({
  product,
  loading = 'lazy',
  variant = 'default',
  className,
}: HorizontalCardProps) {
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
  const isCompact = variant === 'compact';

  return (
    <div
      className={cn(
        'flex w-full overflow-hidden rounded-lg',
        !isCompact && 'border-border bg-canvas border',
        className
      )}
    >
      <div
        className={cn(
          'relative aspect-square shrink-0',
          isCompact ? 'w-24' : 'w-32'
        )}
      >
        <Image
          src={imageUrl && !hasError ? imageUrl : DEFAULT_WHISKY_IMAGE}
          alt={`${name} ${originalName}` || ''}
          fill
          sizes={isCompact ? '96px' : '128px'}
          loading={loading}
          className={cn(
            // compact(모달 목록)는 정사각 썸네일로 맞춰 자른다.
            // 기본형은 상품 전체가 보여야 해서 여백을 남긴다.
            isCompact ? 'rounded-xl object-cover' : 'rounded-lg object-contain'
          )}
          onError={() => setHasError(true)}
        />
      </div>

      {isCompact ? (
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 px-4">
          <p className="text-body-sm-strong truncate">{name}</p>
          <p className="text-body-sm text-fg-muted truncate">{originalName}</p>
          <p className="text-price">
            {discountRate > 0 && (
              <span className="text-primary text-price-discount mr-2">
                -{discountRate}%
              </span>
            )}
            {formatAmount(krPrice)}원
          </p>
          <p className="text-price-sub text-fg-muted">
            ¥{formatAmount(jpPriceYen) ?? '-'}
            {volumeMl != null && ` · ${volumeMl}ml`}
          </p>
        </div>
      ) : (
        <div className="min-w-0 flex-1 p-4">
          <p className="text-section-title truncate">{name}</p>
          <p className="text-body-sm text-fg-muted truncate">{originalName}</p>
          <div className="text-price mt-2">
            {discountRate > 0 && (
              <span className="text-primary text-price-discount mr-1">
                -{discountRate}%
              </span>
            )}
            <span>
              {formatAmount(jpPrice)}원
              <span className="text-price-sub text-fg-muted">
                (일본 최저가)
              </span>
            </span>
          </div>
          <p className="text-price">
            {formatAmount(krPrice)}원
            <span className="text-price-sub text-fg-muted">(한국 최저가)</span>
            {volumeMl != null && (
              <span className="text-price-sub text-fg-muted">
                {' '}
                · {volumeMl}ml
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
