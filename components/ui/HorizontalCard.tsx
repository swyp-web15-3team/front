'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Product } from '@/types/product';

interface HorizontalCardProps {
  product: Product;
  loading?: 'eager' | 'lazy';
  className?: string;
}

export function HorizontalCard({
  product,
  loading = 'lazy',
  className,
}: HorizontalCardProps) {
  const {
    imageUrl = '', // 추후 기본 이미지 URL로 변경 가능
    name,
    originalName,
    discountRate = 0,
    krPrice,
    jpPrice,
    volumeMl,
  } = product;
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={cn(
        'border-border bg-canvas flex w-full overflow-hidden rounded-lg border',
        className
      )}
    >
      <div className="relative aspect-square w-32 shrink-0">
        {imageUrl && !hasError ? (
          <Image
            src={imageUrl}
            alt={`${name} ${originalName}` || ''}
            fill
            sizes="128px"
            loading={loading}
            className="rounded-lg object-contain"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="bg-surface-sunken text-caption text-fg-subtle flex h-full w-full items-center justify-center rounded-lg text-center">
            이미지 로딩 실패
          </div>
        )}
      </div>
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
            {jpPrice?.toLocaleString('ko-KR')}원
            <span className="text-price-sub text-fg-muted">(일본 최저가)</span>
          </span>
        </div>
        <p className="text-price">
          {krPrice?.toLocaleString('ko-KR')}원
          <span className="text-price-sub text-fg-muted">(한국 최저가)</span>
          {volumeMl != null && (
            <span className="text-price-sub text-fg-muted">
              {' '}
              · {volumeMl}ml
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
